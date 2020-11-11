// #region .yaml support
const YAML = require('yaml')
const fs = require('fs')
require.extensions['.yml'] = function(module, filename) {
  module.exports = YAML.parse(fs.readFileSync(filename, 'utf8'))
}
// #endregion .yaml support
const dispatcher = require('bot-framework/dispatcher')
const { LoggerFactory } = require('logger.js')
const logger = LoggerFactory.getLogger('client', 'cyan')
logger.debug('Debug logging was turned on.')
const Discord = require('discord.js')
/**
 * @type { { prefix: string, token: string, owners: Array<string>, debug: boolean } }
 */
const config = require('./config.yml')
process.env.debug = process.argv.includes('--debug') || config.debug
logger.config(process.env.debug)
const client = new Discord.Client()
const data = require('./src/data')
const lang = require('./lang/en.json')
const hashGenerator = require('./src/functions/generateCommitHash')
const hashLength = config.hashLength || 30

client.on('ready', () => {
  client.user.setActivity(`Say ${config.prefix}help`)
  logger.info('Logged in as ' + client.user.tag)
})

client.on('message', async msg => {
  if (msg.content.startsWith(config.prefix)) {
    logger.info(`${msg.author.tag} [${msg.author.id}] sent command: ${msg.content}`)
    dispatcher(msg, lang, config.prefix, config.owners, config.prefix)
  }
})

logger.info('Waiting for database...')
process.once('dbready', () => {
  logger.info('Logging in...')
  client.login(config['token'])
})

process.on('SIGINT', async () => {
  await client.destroy()
  logger.info('Successfully disconnected from Discord.')
  process.exit()
})

client.on('channelCreate', channel => {
  const invalidTypes = ['dm', 'group'] // DMChannel and GroupDMChannel will be ignored
  if (invalidTypes.includes(channel.type)) return
  data.commit(hashGenerator(hashLength), channel.guild.id, 'channelCreate', `${channel.id},${channel.name},${channel.type},${channel.parentID}`)
})

client.on('channelDelete', channel => {
  const invalidTypes = ['dm', 'group'] // DMChannel and GroupDMChannel will be ignored
  if (invalidTypes.includes(channel.type)) return
  data.commit(hashGenerator(hashLength), channel.guild.id, 'channelDelete', `${channel.id},${channel.name},${channel.type},${channel.parentID}`)
})

client.on('emojiCreate', emoji => {
  data.commit(hashGenerator(hashLength), emoji.guild.id, 'emojiCreate', `${emoji.id},${emoji.name},${emoji.url}`)
})

client.on('emojiDelete', emoji => {
  data.commit(hashGenerator(hashLength), emoji.guild.id, 'emojiDelete', `${emoji.id},${emoji.name},${emoji.url}`)
})

client.on('channelUpdate', (oldc, newc) => {
  const invalidTypes = ['dm', 'group'] // DMChannel and GroupDMChannel will be ignored
  if (invalidTypes.includes(newc.type)) return
  if (oldc.name !== newc.name) return data.commit(hashGenerator(hashLength), newc.guild.id, 'channelNameUpdate', `${newc.id},${oldc.name},${newc.name}`)
  if (oldc.parentID !== newc.parentID) return data.commit(hashGenerator(hashLength), newc.guild.id, 'channelParentUpdate', `${newc.id},${newc.name},${oldc.parent.name.replace(/,/g, '<colon>')},${newc.parent.name.replace(/,/g, '<colon>')},${oldc.parentID},${newc.parentID}`)
  if (oldc.topic !== newc.topic) return data.commit(hashGenerator(hashLength), newc.guild.id, 'channelTopicUpdate', `${newc.id},${newc.name},${oldc.topic.replace(/,/g, '<colon>')},${newc.topic.replace(/,/g, '<colon>')}`)
  if (oldc.position !== newc.position) return data.commit(hashGenerator(hashLength), newc.guild.id, 'channelPositionUpdate', `${newc.id},${newc.name},${oldc.position},${newc.position}`)
  if (oldc.nsfw !== newc.nsfw) return data.commit(hashGenerator(hashLength), newc.guild.id, 'channelNSFWUpdate', `${newc.id},${newc.name},${oldc.nsfw},${newc.nsfw}`)
})

module.exports = { client, lang }
