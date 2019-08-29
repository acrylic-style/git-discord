module.exports = (server, type, data) => {
  const { client } = require('../../client')
  switch (type) {
    case 'channelCreate': { // rollback of channel creation -> delete channel
      client.channels.get(data.split(',')[0]).delete()
      break
    }
    case 'channelDelete': { // rollback of channel deletion -> create channel
      client.guilds.get(server).createChannel(data.split(',')[1], { type: data.split(',')[2], parent: data.split(',')[2] })
      break
    }
  }
}
