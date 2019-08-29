const YAML = require('yaml')
const fs = require('fs')
require.extensions['.yml'] = function(module, filename) {
  module.exports = YAML.parse(fs.readFileSync(filename, 'utf8'))
}
const dispatcher = require('bot-framework/dispatcher')
const { LoggerFactory } = require('logger.js')
const logger = LoggerFactory.getLogger('client', 'cyan')
const Discord = require('discord.js')
/**
 * @type { { prefix: string, token: string, owners: Array<string> } }
 */
const config = require('./config.yml')
const client = new Discord.Client()
const data = require('./src/data')
const lang = require('./lang/en.json')
const hashGenerator = require('./src/functions/generateCommitHash')

client.on('ready', () => {
  client.user.setActivity(`Say ${config.prefix}help`)
  logger.info('Logged in as ' + client.user.tag)
})

client.on('message', async msg => {
  if (msg.content.startsWith(config.prefix)) {
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
  data.commit(hashGenerator(80), channel.guild.id, 'channelCreate', channel.id, Date.now())
})

client.on('channelDelete', channel => {
  const invalidTypes = ['dm', 'group'] // DMChannel and GroupDMChannel will be ignored
  if (invalidTypes.includes(channel.type)) return
  data.commit(hashGenerator(80), channel.guild.id, 'channelDelete', channel.id, Date.now())
})

module.exports = { client, lang }
