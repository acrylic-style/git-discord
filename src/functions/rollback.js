module.exports = (server, type, data) => {
  const { client } = require('../../client')
  const datar = data.split(',') // data array
  switch (type) {
    case 'channelCreate': { // rollback of channel creation -> delete channel
      // same as channelDelete
      client.channels.get(datar[0]).delete()
      break
    }
    case 'channelDelete': { // rollback of channel deletion -> create channel
      // [0] = id of channel, [1] = name of channel, [2] = type of channel, [3] = parent id of channel
      client.guilds.get(server).createChannel(datar[1], { type: datar[2], parent: datar[3] })
      break
    }
    case 'emojiDelete': {
      // [0] = id of emoji, [1] = name of emoji, [2] = url of emoji
      client.guilds.get(server).createEmoji(datar[2], datar[1])
      break
    }
    case 'emojiCreate': {
      // same as emojiDelete
      client.guilds.get(server).deleteEmoji(client.guilds.get(server).emojis.get(datar[0]))
      break
    }
    case 'channelNameUpdate': { // revert of channel name update, so it'll change to old channel name
      // [0] = channel id, [1] = old channel name, [2] = new channel name
      client.channels.get(datar[0]).setName(datar[1])
      break
    }
    case 'channelParentUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old parent name, [3] = new parent name, [4] = old parent id, [5] = new parent id
      client.channels.get(datar[0]).setParent(datar[4])
      break
    }
    case 'channelTopicUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old topic, [3] = new topic
      client.channels.get(datar[0]).setTopic(datar[2].replace(/<colon>/g, ','))
      break
    }
    case 'channelPositionUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old position, [3] = new position
      client.channels.get(datar[0]).setPosition(Number.parseInt(datar[2]))
      break
    }
    case 'channelNSFWUpdate': {
      // almost same as channelPositionUpdate, but nsfw instead of position.
      client.channels.get(datar[0]).setNSFW(datar[2] === 'false' ? false : true)
      break
    }
    default: throw new ReferenceError('Undefined rollback operation')
  }
}
