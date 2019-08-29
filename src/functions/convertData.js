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
  const channel = client.channels.get(data) || data // eslint-disable-line
  switch (type) {
    case 'channelCreate': return { data: client.channels.get(data), description: f(lang.convert.channelCreate, data, new Date(date).toLocaleString()) }
    case 'channelDelete': return { data: client.channels.get(data), description: f(lang.convert.channelDelete, data, new Date(date).toLocaleString()) }
    default: return { data, description: f(lang.convert.no_description, data, new Date(date).toLocaleString()) }
  }
}
