const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('fuck', { requiredOwner: true })
  }

  async run(msg) {
    msg.channel.send({ files: [ 'https://img.acrylicstyle.xyz/upload/162158118190/736584104/fuck.PNG' ] })
  }
}
