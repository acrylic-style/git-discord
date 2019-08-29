const f = require('string-format')
const Discord = require('discord.js') // eslint-disable-line
// ^ for type completion

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
module.exports = (type, data, date) => {
  const { client, lang } = require('../../client')
  const channel = client.channels.get(data) || data
  switch (type) {
    case 'channelCreate': return { data: client.channels.get(data), description: f(lang.convert.channelCreate, channel, new Date(date).toLocaleString()) }
    case 'channelDelete': return { data: client.channels.get(data), description: f(lang.convert.channelDelete, channel, new Date(date).toLocaleString()) }
    default: return { data, description: f(lang.convert.no_description, data, new Date(date).toLocaleString()) }
  }
}
