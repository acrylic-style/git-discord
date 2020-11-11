const f = require('string-format')
const Discord = require('discord.js') // eslint-disable-line
// ^ for typing

/**
 * @param {string} type
 * @param {string} data
 * @returns { {
 *   data:
 *       Discord.TextChannel
 *     | Discord.VoiceChannel
 *     | Discord.CategoryChannel
 *     | Discord.GuildChannel
 *     | Discord.NewsChannel
 *     | Discord.StoreChannel
 *     | string,
 *   description: string,
 * } }
 */
module.exports = async (type, data, date) => {
  const { client, lang } = require('../../client')
  const channel = await client.channels.fetch(data.split(',')[0]) || data.split(',')[1] // eslint-disable-line
  const ds = new Date(date).toLocaleString()
  switch (type) {
    case 'channelCreate':
    case 'channelDelete':
    case 'emojiCreate':
    case 'emojiDelete':
      return { data: await client.channels.fetch(data), description: f(lang.convert[type], data.split(',')[1], ds) }
    case 'channelNameUpdate':
      return { data: await client.channels.fetch(data), description: f(lang.convert[type], data.split(',')[1], data.split(',')[2], ds) }
    case 'channelParentUpdate':
      return { data: await client.channels.fetch(data), description: f(lang.convert[type], data.split(',')[1], data.split(',')[5].replace(/<colon>/g, ','), data.split(',')[4].replace(/<colon>/g, ','), ds) }
    case 'channelTopicUpdate':
      return { data: await client.channels.fetch(data), description: f(lang.convert[type], data.split(',')[1], ds) }
    case 'channelPositionUpdate':
    case 'channelNSFWUpdate':
      return { data: await client.channels.fetch(data), description: f(lang.convert[type], data.split(',')[1], data.split(',')[3], data.split(',')[2], ds) }
    default:
      return { data, description: f(lang.convert.no_description, data, ds) }
  }
}
