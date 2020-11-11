const { Command } = require('bot-framework')
const convert = require('../src/functions/convertData')
const Discord = require('discord.js')

module.exports = class extends Command {
  constructor() {
    super('log', { args: ['[page/filter] [filter/page]'] })
  }

  async run(msg, lang, args, sendDeletable) {
    let page = 1
    let find = ''
    if (args.length === 2 && typeof args[1] === 'number') {
      page = Number.parseInt(args[1])
    } else if (args.length === 2 && typeof args[1] !== 'number') {
      find = String(args[1])
    } else if (args.length === 3 && typeof args[1] === 'number') {
      page = Number.parseInt(args[1])
      find = String(args[2])
    } else if (args.length === 3 && typeof args[1] !== 'number') {
      page = Number.parseInt(args[2])
      find = String(args[1])
    }
    if (isNaN(page)) page = 1
    const data = require('../src/data')
    let commits = await data.getCommitLogs(msg.guild.id)
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
    embed.setDescription(`${page}/${Math.ceil(commits.length/25)} pages, showing ${Math.min(commits.length, page*25)}/${commits.length} entries`)
    if (find !== '') commits = commits.filter(c => convert(c.type, c.data, c['committed_at']).description.toLowerCase().includes(find.toLowerCase()))
    for (let i = (page-1)*25; i < page*25-1; i++) {
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
      const convertedData = await convert(type, data, date)
      //if (args.length === 3) if (!convertedData.description.toLowerCase().includes(Stringargs[2].toLowerCase())) continue
      embed.addField('Commit: ' + hash, convertedData.description + '\nFull commit hash: ' + commit['commit_hash'])
      if (i >= commits.length-1) break
      if (i >= (page*25)-1) break
    }
    sendDeletable(embed)
  }
}
