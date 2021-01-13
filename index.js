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
        let content = await firebase.GET_USER_STATUS(msg.author.id);
        console.log(content);
        break;
      case content.startsWith("stuck")?content: '':
        msg.react("👩‍⚕️");
        if (msg.channel.type === "dm"){
          msg.reply(REPLIES.question_dm);
        }
        else{
          try {
            let qno = content.split()[1];
            let content = await firebase.GET_QUESTION_STATUS(qno);
            if (!content || !content.solved_by){
              throw "content not found"
            }
            else{
              let solvers = content.solved_by.filter(solver => msg.guild.members.cache.exists("id",solver));
              if (!solvers)
                throw "noone's solved it"
              else
                msg.channel.send(`Question solved by:${solvers}`);
            }
          }
          catch(err) {
            msg.reply(REPLIES.question_error)
          }
        }
      default:
        msg.reply(REPLIES.default);
    }
  }
});
