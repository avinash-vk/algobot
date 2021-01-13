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


const leaderboardEmbed = (usernames, scores, solved, msg) => {
	let usernamesStr="", scoresStr="", solvedStr="";
	for (let i = 0; i< usernames.length; i++) {
		usernamesStr += `\`${i + 1}\` ${usernames[i]}\n`;
		scoresStr += `\`${scores[i]}\`\n`;
		solvedStr += `\`${solved[i]}\`\n`;
	}

	return new Discord.MessageEmbed()
		.setAuthor(`Leaderboard for ${msg.guild.name}`, msg.guild.iconURL({ dynamic: true }))
		.setColor("#051267")
		.addFields({ name: 'User', value: usernamesStr, inline: true },
			{ name: 'Score', value: scoresStr, inline: true },
			{ name: 'Questions-solved', value: solvedStr, inline: true });
}

const EMBEDS = {
  questionEmbed,
	leaderboardEmbed
};
module.exports = EMBEDS;
