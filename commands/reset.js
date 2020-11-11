const { Command } = require('bot-framework')
const convert = require('../src/functions/convertData')
const rollback = require('../src/functions/rollback')
const Discord = require('discord.js')
const logger = require('logger.js').LoggerFactory.getLogger('commands:reset', 'purple')

module.exports = class extends Command {
  constructor() {
    super('reset', { args: ['<Full commit hash>'], permission: 8 })
  }

  async run(msg, lang, args, sendDeletable) {
    if (args.length <= 1) return sendDeletable(':x: You need full commit hash!')
    const data = require('../src/data')
    const commits = await data.getCommitLogs(msg.guild.id)
    const embed = new Discord.MessageEmbed()
    embed.setTitle(lang.commit_logs)
    embed.setTimestamp()
    embed.setColor([0,255,0])
    if (commits.length === 0) {
      embed.setColor([255,0,0])
      embed.setDescription('There are no commits in this server!')
      sendDeletable(embed)
      return
    }
    if (!commits.some(commit => commit['commit_hash'] === args[1])) {
      embed.setColor([255,0,0])
      embed.setDescription('Couldn\'t find commit! (Did you specify full commit hash?)')
      return
    }
    for (let i = 0; i <= commits.length-1; i++) {
      const commit = commits[i]
      if (commit['commit_hash'] === args[1]) break
      const hash = commit['commit_hash'].substring(0, 7)
      const server = commit['server_id']
      if (server !== msg.guild.id) {
        logger.error(`Validation error: Successfully fetched all commits as ${msg.guild.id} but found incorrect guild data.`)
        logger.error(`Commit hash: ${commit['commit_hash']}\nGuild should be: ${msg.guild.id}\nBut actually provided: ${server}`)
        embed.setColor([255,0,0])
        embed.setDescription('Validation error, please report it for developers!')
        sendDeletable(embed)
        return
      }
      const type = commit['type']
      const data = commit['data']
      const date = commit['committed_at']
      try { // eslint-disable-line
        await rollback(server, type, data)
        logger.debug(`Rollback of ${commit['commit_hash']} (in ${commit['server_id']}) has been rollbacked successfully.`)
      } catch (e) {
        logger.error('There was an error while rollbacking commit!')
        logger.error(require('util').inspect(e))
        embed.setColor([255,0,0])
        embed.setDescription('There was an error while rollbacking commit.\nReset operation has been cancelled.\n\nError: ' + e)
        sendDeletable(embed)
        return
      }
      const convertedData = convert(type, data, date)
      embed.addField('Commit: ' + hash, convertedData.description)
      commit.destroy()
      //if (i >= commits.length-1) break
    }
    const ccommit = await data.getCommit(args[1])
    const convertedData = convert(ccommit.type, ccommit.data, ccommit.date)
    embed.setDescription('HEAD is now: ' + convertedData.description + ` (${args[1].substring(0, 7)})\n\nRollbacked commits:`)
    sendDeletable(embed)
  }
}
