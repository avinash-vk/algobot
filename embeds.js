const Discord = require('discord.js');

// TODO: color properly
const questionEmbed = ({id,link,title,difficulty}) => new Discord.MessageEmbed()
	.setColor(difficulty===1
    ?"#008000"
    :difficulty===2
    ?"#FFFF00"
    :"#FF0000"
  )
	.setTitle(title)
	.setURL(link)
	.setAuthor(`Leetcode #${id}`, 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png', 'https://leetcode.com/')
	.setDescription(
    difficulty===1
      ?"```css\nEasy```"
      :difficulty===2
      ?"```fix\nMedium```"
      :"```prolog\nHard```")

const EMBEDS = {
  questionEmbed
};
module.exports = EMBEDS;
