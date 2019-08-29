const { Command } = require('bot-framework')
const convert = require('../src/functions/convertData')
const rollback = require('../src/functions/rollback')
const Discord = require('discord.js')
const logger = require('logger.js').LoggerFactory.getLogger('commands:rollback', 'purple')

module.exports = class extends Command {
  constructor() {
    super('rollback', { args: ['<Full commit hash>'], permission: 8 })
  }

  async run(msg, lang, args, sendDeletable) {
    if (args.length <= 1) return sendDeletable(':x: You need full commit hash!')
    const data = require('../src/data')
    const commit = await data.getCommit(args[1])
    const embed = new Discord.RichEmbed()
    embed.setTitle(lang.commit_logs)
    embed.setTimestamp()
    embed.setColor([0,255,0])
    if (commit == null || commit == undefined) return sendDeletable(':x: Couldn\'t find commit!')
    if (commit['server_id'] !== msg.guild.id) {
      logger.error(`Validation error: Successfully fetched all commits as ${msg.guild.id} but found incorrect guild data.`)
      logger.error(`Commit hash: ${commit['commit_hash']}\nGuild should be: ${msg.guild.id}\nBut actually provided: ${commit['server_id']}`)
      embed.setColor([255,0,0])
      embed.setDescription('Validation error, please report it for developers!')
      sendDeletable(embed)
      return
    }
    try { // eslint-disable-line
      rollback(commit['server_id'], commit['type'], commit['data'])
      logger.debug(`Rollback of ${commit['commit_hash']} (in ${commit['server_id']}) has been rollbacked successfully.`)
    } catch (e) {
      logger.error('There was an error while rollbacking commit!')
      logger.error(require('util').inspect(e))
      embed.setColor([255,0,0])
      embed.setDescription('There was an error while rollbacking commit.\nReset operation has been cancelled.\n\nError: ' + e)
      sendDeletable(embed)
      return
    }
    const convertedData = convert(commit.type, commit.data, commit.date)
    embed.setDescription(`Rollbacked commit: ${convertedData.description} (${args[1].substring(0, 7)})`)
    sendDeletable(embed)
  }
}
