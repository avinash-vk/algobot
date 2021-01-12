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
/*
  *********** BOT COMMANDS ************
*/

client.on('ready', () => {
  console.log(`BOT READY!`);
});

client.on('message', async msg => {
  if (msg && msg.content[0] === ";"){
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
        const question = await getRandomProblem();
        console.log(question);
        msg.author.send(REPLIES.challenge_me);
        msg.author.send(EMBEDS.questionEmbed({...question}));
        break;
      default:
        msg.reply(REPLIES.default);
    }
  }
});
