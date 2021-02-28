const Discord = require('discord.js');
const fs      = require('fs');

const prefix  = process.env.PREFIX;
const strings = require('../../res/strings');

const { autoPush } = require('../../functions/autoPush.js');
const { warnUser } = require('../../functions/warnUser.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

const NO_TEXTURE_FOUND = -1

// useful
Array.prototype.remove = function() {
	return this.filter(item => item !== el)
}

module.exports = {
	name: 'contributors',
	aliases: [ 'contributor' ],
	description: 'Use: `/contributors add ...` to add a new author.\nuse: `/contributors remove ...` to remove a contributor',
	guildOnly: false,
	uses: 'Moderators',
	syntax: `${prefix}contributors <add/remove> <path+texture name> <type> <c32/c64> <author>`,

	async execute(client, message, args) {
		// extract args
		const addOrRemove = args[0]
		const pathTexture = args[1]
		let   javaOrBedrock = args[2]
		const packResolution = args[3]
		let   discordTag = args[4]

		// reject directly not administrator
		if (!message.member.hasPermission('ADMINISTRATOR'))
			return warnUser(message,strings.COMMAND_NO_PERMISSION)

		// update one
		if (addOrRemove !== undefined && addOrRemove === 'update') {
			autoPush('Compliance-Resource-Pack', 'JSON', 'main', `Manual Update executed by: ${message.author.username}`, `./json`)
			return await message.react('✅')
		}

		// also you should verify arguments number
		if (args.length !== 5)
			return warnUser(message, 'contributors command always have 5 arguments')

		if (addOrRemove === undefined || (addOrRemove !== 'add' && addOrRemove !== 'remove'))
			return warnUser(message, 'contributors command only accepts update, add or remove')

		if (javaOrBedrock === undefined || (javaOrBedrock !== 'java' && javaOrBedrock !== 'bedrock'))
			return warnUser(message, 'contributors command only accepts java or bedrock edition')
		else
			javaOrBedrock = javaOrBedrock.toLowerCase()

		if (packResolution === undefined || (packResolution !== 'c32' && packResolution !== 'c64'))
			return warnUser(message, 'contributors command only accepts c32 and c64 resolution')

		if (discordTag === undefined || !discordTag.includes('#'))
			return warnUser(message, 'The author must be a Discord Tag, ex: `Name#1234`')

		// try to find user
		try {
			client.users.cache.find(u => u.tag === discordTag).id
		} catch(error) {
			return warnUser(message, 'This user doesn\'t exist!')
		}

		discordTag = client.users.cache.find(u => u.tag === discordTag).id

		// will be used later
		let textures
		let release
		let write

		let textureIndex = NO_TEXTURE_FOUND
		let i = 0
		
		if (javaOrBedrock === 'java') {
			textures = await jsonContributionsJava.read()
			release = jsonContributionsJava.release
			write = jsonContributionsJava.write

			while (i < textures.length && !textureIndex) {
				if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(pathTexture))
					textureIndex = i
				++i
			}
		} else {
			textures = await jsonContributionsBedrock.read()
			release = jsonContributionsBedrock.release
			write = jsonContributionsBedrock.write

			// find texture index
			while (i < textures.length && !textureIndex) {
				if (textures[i].path.includes(pathTexture))
					textureIndex = i
				++i
			}
		}
		
		if (textureIndex === NO_TEXTURE_FOUND) {
			// in this case you should release the file
			release()
			return warnUser(message, 'Unknown texture, please check spelling')
		}

		if (addOrRemove === 'add') {
			// create author array if not defined else append
			if (textures[index][packResolution].author == undefined)
				textures[index][packResolution].author = [discordTag]

			else if (!textures[index][packResolution].author.includes(discordTag)) {}
				textures[index][packResolution].author.push(discordTag)
		}
		// else it is remove
		else {
			// warn user if no author to remove
			if (textures[index][packResolution].author == undefined) {
				release()
				return warnUser(message, 'This texture doesn\'t have an author!')
			}

			// warn if user not in this texture
			if(!textures[index][packResolution].author.includes(discordTag)) {
				release()
				return warnUser(message, 'This author doesn\'t exist')
			}

			// remove this bad boy
			if (textures[index][packResolution].author.length > 1)
				textures[index][packResolution].author = textures[index][packResolution].author.remove(discordTag)
				else
					textures[index][packResolution].author = []
		}

		await write(textures)
		return await message.react('✅')
	}
}
