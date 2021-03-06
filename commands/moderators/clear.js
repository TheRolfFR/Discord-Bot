const Discord = require('discord.js');
const colors = require('../../res/colors');
const prefix = process.env.PREFIX;

const strings = require('../../res/strings');
const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'clear',
	description: strings.HELP_DESC_CLEAR,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}clear <amount>`,
	async execute(client, message, args) {

		if (message.member.hasPermission('ADMINISTRATOR')) {
			if (args != '') {
				if (isNaN(args)) return await message.reply(strings.COMMAND_NOT_A_NUMBER);

				if (args > 200) return await message.reply(strings.CLEAR_TOO_MUCH);
				if (args < 1) return await message.reply(strings.CLEAR_NOT_ENOUGH);

				var amount = parseInt(args, 10) + 1
				const messages = await message.channel.messages.fetch({ limit: amount });
				await message.channel.bulkDelete(messages);
        var embed = new Discord.MessageEmbed()
			    .setAuthor(`${message.author.tag} bulk deleted ${args} messages!`)
			    .setColor(colors.RED)
			    .setThumbnail(message.author.displayAvatarURL())
			    .setDescription(`[Jump to location](${message.url})\n\n**Server**: ${message.guild}\n\n**Channel**: <#${message.channel.id}>`)
			    .setTimestamp()

		    await client.channels.cache.get('798676864599195655').send(embed);

			} else return warnUser(message,strings.COMMAND_PROVIDE_A_NUMBER);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
