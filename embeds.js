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
	.addFields(
		{ name:"...\n", value:"✅ - I solved all the test cases\n\n❌ - I couldn't find a solution to the problem",inline:true},
	)

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

const statusEmbed = (user, msg, solved_count, score) => {
		const {id, username, nickname} = user;
		return new Discord.MessageEmbed()
			.setTitle(msg.channel.type == "dm" ? "" : msg.guild.member(id).nickname)
			.setDescription(username)
			.setAuthor("Status Update", msg.author.avatarURL())
			.setColor("#d91c1c")
			.addFields(
				{ name: 'Score', value: score, inline: true },
				{ name: 'Questions-solved', value: solved_count, inline: true }
			);
}

const stuckEmbed = (users, qno) => {
	return new Discord.MessageEmbed()
		.setColor("#f4f4f4")
		.addFields(
			{ name: `Question #${qno} solved by:`, value: users}
		);
}

const inspirationEmbed = (content, author) => {
	return new Discord.MessageEmbed()
		.setColor("#ff7b00")
		.addFields(
			{ name: content, value: `- ${author}`}
		)

}

const sessionEmbed = (questions, author,title) => {
	const getDifficultyIndicator = (difficulty) => {
		return difficulty===1
      ?"`Easy`"
      :difficulty===2
      ?"`Medium`"
      :"`Hard`"
	}
	return new Discord.MessageEmbed()
		.setColor("#f0058e")
		.setTitle(title)
		.setTimestamp()
		.setDescription(`question solving session`)
		.addFields (
			...questions.map((question,i) => {
				return {
					name: `${i+1}. Question #${question.id} ${getDifficultyIndicator(question.difficulty)}`,
					value: `[${question.title}](${question.link})`,
				}
			})
		)
}

const EMBEDS = {
  questionEmbed,
	leaderboardEmbed,
	statusEmbed,
	stuckEmbed,
	inspirationEmbed,
	sessionEmbed
};

module.exports = EMBEDS;
