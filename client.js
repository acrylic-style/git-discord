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
const lang = require('./lang/en.json')

client.on('ready', () => {
  client.user.setActivity(`Say ${config.prefix}help`)
  logger.info('Logged in as ' + client.user.tag)
})

client.on('message', async msg => {
  if (msg.content.startsWith(config.prefix)) {
    dispatcher(msg, lang, config.prefix, config.owners, config.prefix)
  }
})

logger.info('Logging in...')
client.login(config.token)
