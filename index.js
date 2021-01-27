// Configuring env
require("dotenv").config();

// Initialising the app
const Discord = require('discord.js');
const client = new Discord.Client();

// Connecting it to the appropriate endpoint
client.login(process.env.DISCORD_TOKEN);

// Custom bot replies
const REPLIES = require("./replies.js");
const EMBEDS = require("./embeds.js");
const {getRandomProblem, getRandomProblems} = require("./leetcodeScraper.js");

// Firebase database config
const firebase = require("./firebase");
const axios = require("axios");
/*
  *********** BOT COMMANDS ************
*/
// Schedule how often
// TODO SCHEDULED TASKS
let BLOCKED = [];
const TIME_HOURS = 6;
const NOTIFICATIONS_CHANNEL = 'algobot-notifications';

const fetchInspo = async () => {
  let {content,author} = (await axios.get("https://api.quotable.io/random?tags=inspirational|future|technology")).data;
  return EMBEDS.inspirationEmbed(content,author);
}

client.on('ready', () => {
  console.log("BOT IS READY!");
  setInterval( ()=>{
    client.guilds.cache.map(async server => {
      if (!BLOCKED.includes(server.id)){
        let channel = server.channels.cache.find(ch => ch.name == NOTIFICATIONS_CHANNEL)
        if(!channel)
          await server.channels.create(NOTIFICATIONS_CHANNEL,"text")

        channel = server.channels.cache.find(ch => ch.name == NOTIFICATIONS_CHANNEL);
        channel.send(await fetchInspo());
      }
    })
  }, 1000*60*60*TIME_HOURS);
})

client.on('message', async msg => {
  if (msg && msg.content[0] === ";"){
    let content = msg.content.substring(1).trim().toLowerCase();
    switch(content){
      case "block":
        !BLOCKED.includes(msg.guild.id) && BLOCKED.push(msg.guild.id);
        msg.channel.send(REPLIES.blocked);
        break;
      case "unblock":
        BLOCKED.includes(msg.guild.id) && BLOCKED.splice(BLOCKED.indexOf(msg.guild.id),1);
        msg.channel.send(REPLIES.unblocked);
        break;
      case "intro":
        msg.channel.send(REPLIES.intro);
        break;
      case "help":
        msg.channel.send(REPLIES.help);
        break;
      case "dm":
        msg.react("♋");
        msg.author.send(REPLIES.dm);
        break;
      case "challenge-me":
      case "challenge me":
        msg.react("🖖🏻");
        random_question = await getRandomProblem();
        msg.author.send(REPLIES.challenge_me);
        msg.author.send(EMBEDS.questionEmbed({...random_question})).then(question => {
          question.react("✅");
          question.react("❌");
          const filter = (reaction, user) => {
              return (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id != question.author.id;
          }
          const collector = question.createReactionCollector(filter, { time: 10800000 });
          collector.on('collect', async (reaction, user) => {
            let emoji = reaction.emoji;
            if (emoji.name == '✅') {
                question.reply(REPLIES.question_solve);
                await firebase.SOLVE_QUESTION(random_question.id.toString(), user.id, random_question.difficulty*10);
            }
            else if (emoji.name == '❌') {
                question.reply(REPLIES.question_unsolve);
                await firebase.UNSOLVE_QUESTION(random_question.id.toString(), user.id, random_question.difficulty*10);
            }
          });
        });
        break;
      case "challenge-all":
      case "challenge all":
        if (msg.channel.type === "dm"){
          msg.react("👎🏻");
          msg.reply(REPLIES.challenge_all_error);
        }
        else{
          msg.react("🖖🏻");
          random_question = await getRandomProblem();
          const mems = await msg.guild.members.fetch()
          mems.forEach(member => {
            if (member.id != client.user.id && !member.user.bot){
              member.send(REPLIES.challenge_all);
              member.send(EMBEDS.questionEmbed({...random_question})).then(question => {
                question.react("✅");
                question.react("❌");
                const filter = (reaction, user) => {
                    return (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id != question.author.id;
                }
                const collector = question.createReactionCollector(filter, { time: 10800000 });
                collector.on('collect', async (reaction, user) => {
                  let emoji = reaction.emoji;
                  if (emoji.name == '✅') {
                      question.reply(REPLIES.question_solve);
                      await firebase.SOLVE_QUESTION(random_question.id.toString(), user.id, random_question.difficulty*10);
                  }
                  else if (emoji.name == '❌') {
                      question.reply(REPLIES.question_unsolve);
                      await firebase.UNSOLVE_QUESTION(random_question.id.toString(), user.id, random_question.difficulty*10);
                  }
              });
            })
          }
        })}
        break;
      case "my-status":
      case "my status":
        msg.react("🎯");
        try {
          let {score,solved_count} = await firebase.GET_USER_STATUS(msg.author.id);
          let user = await client.users.fetch(msg.author.id);
          msg.channel.send(EMBEDS.statusEmbed(user, msg, solved_count, score));
        }
        catch(err){
          msg.reply("Looks like you haven't really gotten around solving anything yet. Don't give up")
        }
        break;
      case content.startsWith("stuck")?content: '':
        msg.react("👩‍⚕️");
        if (msg.channel.type === "dm"){
          msg.reply(REPLIES.question_dm);
        }
        else{
          try {
            let qno = content.split(" ")[1];
            content = await firebase.GET_QUESTION_STATUS(qno);
            if (!content || !content.solved_by){
              throw "content not found"
            }
            else{
              let solvers = await Promise.all(Object.keys(content.solved_by)
                                  .filter( solver => msg.guild.member(solver)?true:false)
                                  .map( async id => {
                                      let user = await client.users.fetch(id);
                                      return user.username;
                                  }));

                msg.channel.send(EMBEDS.stuckEmbed(solvers, qno));
                msg.channel.send(REPLIES.stuck)
            }
          }
          catch(err) {
            msg.reply(REPLIES.question_error)
          }
        }
        break;
      case content.startsWith("solved")?content: '':
        try {
          let qno = content.split(" ")[1];
          if (!qno){
            throw "content not found"
          }
          else{
            msg.react("🤙");
            // TODO: Add score based on difficulty
            await firebase.SOLVE_QUESTION(qno, msg.author.id, 10);
          }
        }
        catch(err) {
          console.log(err)
          msg.reply(REPLIES.question_error)
        }
        break;
      case content.startsWith("unsolved")?content: '':
        try {
          let qno = content.split(" ")[1];
          if (!qno){
            throw "content not found"
          }
          else{
            msg.react("💪");
            // Add score based on difficulty
            await firebase.UNSOLVE_QUESTION(qno, msg.author.id, 10);
          }
        }
        catch(err) {
          msg.reply(REPLIES.question_error)
        }
        break;
      case "leaderboard":
      case "status-all":
      case "status all":
        msg.react("👩‍⚕️");
        if (msg.channel.type === "dm"){
          msg.reply(REPLIES.question_dm);
        }
        else {
          
          const mems = await msg.guild.members.fetch()
          let members =  mems.map(
            member =>{
              if (member.id != client.user.id && !member.user.bot) return member.id
            } 
          ).filter(stat => stat?1:0);
          let stats = await firebase.GET_LEADERBOARD(members);
          let statids = stats.map(stat => stat.id);
          let others = members.map(member => 
            !statids.includes(member)?{id:member,score:0,solved_count:0}:null
          ).filter(stat => stat?1:0);
          stats.push(...others);
          stats.sort((a,b)=>a.score>b.score?a.score<b.score?1:-1:0);
          let usernames = await Promise.all(stats.map(async stat => (await client.users.fetch(stat.id)).username))
          let scores = stats.map(stat => stat.score);
          let solved = stats.map(stat => stat.solved_count);
          msg.channel.send(EMBEDS.leaderboardEmbed(usernames,scores,solved,msg));
        }
        break;
      case (content.startsWith("start-session")||content.startsWith("start session"))?content: '':
        msg.react("🎯");
        try {
          let [cmd,count,difficulties="",title="Untitled"] = content.split(" ");
          count = parseInt(count);
          difficulties = difficulties.split("").map(d => parseInt(d));
          questions = await getRandomProblems(count,difficulties);

          msg.channel.send(EMBEDS.sessionEmbed(questions,msg.author.username,title));
        }
        catch(err){
          msg.reply(REPLIES.sessionError)
        }
        break;
      default:
        msg.reply(REPLIES.default);
    }
  }
});
