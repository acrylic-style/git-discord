module.exports = async (server, type, data) => {
  const { client } = require('../../client')
  const datar = data.split(',') // data array
  switch (type) {
    case 'channelCreate': { // rollback of channel creation -> delete channel
      // same as channelDelete
      (await client.channels.fetch(datar[0])).delete()
      break
    }
    case 'channelDelete': { // rollback of channel deletion -> create channel
      // [0] = id of channel, [1] = name of channel, [2] = type of channel, [3] = parent id of channel
      (await client.guilds.fetch(server)).createChannel(datar[1], { type: datar[2], parent: datar[3] })
      break
    }
    case 'emojiDelete': {
      // [0] = id of emoji, [1] = name of emoji, [2] = url of emoji
      (await client.guilds.fetch(server)).createEmoji(datar[2], datar[1])
      break
    }
    case 'emojiCreate': {
      // same as emojiDelete
      (await client.guilds.fetch(server)).deleteEmoji(client.guilds.fetch(server).emojis.get(datar[0]))
      break
    }
    case 'channelNameUpdate': { // revert of channel name update, so it'll change to old channel name
      // [0] = channel id, [1] = old channel name, [2] = new channel name
      (await client.channels.fetch(datar[0])).setName(datar[1])
      break
    }
    case 'channelParentUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old parent name, [3] = new parent name, [4] = old parent id, [5] = new parent id
      (await client.channels.fetch(datar[0])).setParent(datar[4])
      break
    }
    case 'channelTopicUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old topic, [3] = new topic
      (await client.channels.fetch(datar[0])).setTopic(datar[2].replace(/<colon>/g, ','))
      break
    }
    case 'channelPositionUpdate': {
      // [0] = channel id, [1] = channel name, [2] = old position, [3] = new position
      (await client.channels.fetch(datar[0])).setPosition(Number.parseInt(datar[2]))
      break
    }
    case 'channelNSFWUpdate': {
      // almost same as channelPositionUpdate, but nsfw instead of position.
      (await client.channels.fetch(datar[0])).setNSFW(datar[2] === 'false' ? false : true)
      break
    }
    default: throw new ReferenceError('Undefined rollback operation')
  }
}
