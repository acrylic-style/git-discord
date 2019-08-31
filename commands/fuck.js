const { Command } = require('bot-framework')

module.exports = class extends Command {
  constructor() {
    super('fuck', { requiredOwner: true })
  }

  async run(msg) {
    const images = [
      'https://img.acrylicstyle.xyz/upload/162158118190/736584104/fuck.PNG',
      'https://img.acrylicstyle.xyz/upload/16215811858/58580369/fuck2.PNG',
      'https://img.acrylicstyle.xyz/upload/16215811858/8810387010/fuck3.PNG',
      'https://img.acrylicstyle.xyz/upload/16215811858/511092976/fuck4.PNG',
      'https://img.acrylicstyle.xyz/upload/16215811858/210104588/fuck5.PNG',
    ]
    msg.channel.send({ files: [ images[Math.floor(Math.random()*images.length)] ] })
  }
}
