const { Command } = require('bot-framework')
const convert = require('../src/functions/convertData')
const Discord = require('discord.js')

module.exports = class extends Command {
  constructor() {
    super('reset')
  }

  async run(msg, lang, args, sendDeletable) {
    const page = 1
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
      const commit = commits[i].dataValues
      const hash = commit['commit_hash'].substring(0, 7)
      const type = commit['type']
      const data = commit['data']
      const date = commit['committed_at']
      const convertedData = convert(type, data, date)
      embed.addField('Commit: ' + hash, convertedData.description)
      if (i >= commits.length-1) break
      if (i >= 25) break
    }
    sendDeletable(embed)
  }
}
