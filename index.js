// Configuring env
require("dotenv").config();

// Initialising the app
const Discord = require('discord.js');
const client = new Discord.Client();

// Connecting it to the appropriate endpoint
client.login(process.env.DISCORD_TOKEN);

// Custom bot replies
const REPLIES = require("./replies.js");

/*
  *********** BOT COMMANDS ************
*/

client.on('ready', () => {
  console.log(`BOT READY!`);
});

client.on('message', msg => {
  if (msg && msg.content[0] === ";"){
    let content = msg.content.substring(1).trim().toLowerCase();
    if (content === "intro") {
      msg.reply(REPLIES.intro);
    }
    else if (content === "dm") {
      msg.react("♋");
      msg.author.send(REPLIES.dm);
    }
  }
});
