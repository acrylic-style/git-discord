const { Command } = require('bot-framework')
const convert = require('../src/functions/convertData')
const Discord = require('discord.js')

module.exports = class extends Command {
  constructor() {
    super('log', { args: ['[page]'] })
  }

  async run(msg, lang, args, sendDeletable) {
    let page = 1
    try { // eslint-disable-line
      page = args.length === 2 ? Number.parseInt(args[1]) : 1
    } catch (e) {
      return sendDeletable(lang.must_number)
    }
    if (isNaN(page)) page = 1
    const data = require('../src/data')
    const commits = await data.getCommitLogs(msg.guild.id)
    const embed = new Discord.RichEmbed()
    embed.setTitle(lang.commit_logs)
    embed.setTimestamp()
    embed.setColor([0,255,0])
    if (commits.length === 0) {
      embed.setColor([255,0,0])
      embed.setDescription('There are no commits in this server!')
      sendDeletable(embed)
      return
    }
    for (let i = (page-1)*25; i <= page*25; i++) {
      if (commits.length <= (page-1)*25) {
        embed.setColor([255,0,0])
        embed.setDescription('There are no commits in specified range.')
        break
      }
      const commit = commits[i]
      const hash = commit['commit_hash'].substring(0, 7)
      const type = commit['type']
      const data = commit['data']
      const date = commit['committed_at']
      const convertedData = convert(type, data, date)
      embed.addField('Commit: ' + hash, convertedData.description + '\nFull commit hash: ' + commit['commit_hash'])
      if (i >= commits.length-1) break
      if (i >= 25) break
    }
    sendDeletable(embed)
  }
}
