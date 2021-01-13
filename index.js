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
const getRandomProblem = require("./leetcodeScraper.js");

// Firebase database config
const firebase = require("./firebase");

/*
  *********** BOT COMMANDS ************
*/

client.on('ready', () => {
  console.log(`BOT READY!`);
});

client.on('message', async msg => {
  if (msg && msg.content[0] === ";"){
    let question;
    let content = msg.content.substring(1).trim().toLowerCase();
    switch(content){
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
        question = await getRandomProblem();
        msg.author.send(REPLIES.challenge_me);
        msg.author.send(EMBEDS.questionEmbed({...question}));
        break;
      case "challenge-all":
      case "challenge all":
        if (msg.channel.type === "dm"){
          msg.react("👎🏻");
          msg.reply(REPLIES.challenge_all_error);
        }
        else{
          msg.react("🖖🏻");
          question = await getRandomProblem();
          msg.guild.members && msg.guild.members.cache.forEach(member => {
            if (member.id != client.user.id && !member.user.bot){
              member.send(REPLIES.challenge_all);
              member.send(EMBEDS.questionEmbed({...question}));
            }
          });
        }
        break;
      case "my-status":
      case "my status":
        msg.react("🎯");
        try {
          let {score,solved_count} = await firebase.GET_USER_STATUS(msg.author.id);
          msg.reply(`Your status is:\nScore:${score}\nQuestions Solved:${solved_count}`)
        }
        catch(err){
          message.reply("Looks like you haven't really gotten around solving anything yet. Don't give up")
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
              if (!solvers)
                throw "noone's solved it"
              else{
                console.log(solvers);
                msg.channel.send(`Question solved by:\n - ${solvers}`);
              }

            }
          }
          catch(err) {
            console.log(err)
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
          let members = msg.guild.members && msg.guild.members.cache.map(
            member => member.id
          );
          let stats = await firebase.GET_LEADERBOARD(members);
          stats.sort((a,b)=>a.score>b.score?1:-1);
          let usernames = await Promise.all(stats.map(async stat => (await client.users.fetch(stat.id)).username))
          let scores = stats.map(stat => stat.score);
          let solved = stats.map(stat => stat.solved_count);
          msg.channel.send(EMBEDS.leaderboardEmbed(usernames,scores,solved,msg));
        }
        break;
      default:
        msg.reply(REPLIES.default);
    }
  }
});
