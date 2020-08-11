console.log('Attempting to start bot...')
const Discord = require('discord.js')
const client = new Discord.Client()
const fetch = require('node-fetch')
const config = require('./config.json')

client.on('ready', async () => {
  const v = validateConfig()
  console.log('Bot is ready.')
  if (v) {
    setInterval(() => {
      updateChannels(config.server_ip, config.server_port)
    }, 300000)
    updateChannels(config.server_ip, config.server_port)
  }
  setInterval(() => {
    setPlayers(config.server_ip, config.server_port)
  }, 300000)
  setPlayers(config.server_ip, config.server_port)
})

function setPlayers(serverIP, serverPort) {
  fetch(`http://mcapi.us/server/status?ip=${serverIP}&port=${serverPort}`)
    .then(r => r.json())
    .then(json => {
      if (json.status == 'error') return console.error('ERROR: Failed to connect to server. Is the bot configured correctly?');
      client.user.setActivity(config.activity_format.replace('{online}', `${json.players.now}`).replace('{max}', `${json.players.max}`), {type: 'PLAYING'})
      console.log(`Player count updated successfully.`)
    })
    .catch(e => {
      console.error(`Player count failed to update:\n${e}`)
    })
}

function updateChannels(serverIP, serverPort) {
  fetch(`http://mcapi.us/server/status?ip=${serverIP}&port=${serverPort}`)
    .then(r => r.json())
    .then(json => {
      if (json.status == 'error') return console.error('ERROR: Failed to connect to server. Is the bot configured correctly?');
      let status = json.online ? 'ONLINE' : 'OFFLINE'

      const channels = require('./channels.json')
      client.channels.cache.get(channels.channel_1_id).setName(`Status: ${status}`)
      client.channels.cache.get(channels.channel_2_id).setName(`Players: ${json.players.now}/${json.players.max}`)
      console.log("Live channels updated successfully.");
    })
    .catch(e => {
      console.error(`Live channels failed to update:\n${e}`)
    })
}

function validateConfig() {
  let config = require('./channels.json')
  if (typeof config.enable_channels !== 'boolean') {
    console.error('ERROR: Value of "enable_channels" in channels.json must be true or false.')
    process.exit()
  }
  if (!config.enable_channels) return false;
  if (!client.channels.cache.get(config.channel_1_id)) {
    console.error('ERROR: The ID for channel 1 provided in channels.json is incorrect.')
    process.exit()
  }
  let channel1 = client.channels.cache.get(config.channel_1_id)
  if (!client.channels.cache.get(config.channel_2_id)) {
    console.error('ERROR: The ID for channel 2 provided in channels.json is incorrect.')
    process.exit()
  }
  let channel2 = client.channels.cache.get(config.channel_2_id)
  if (channel1.id == channel2.id) {
    console.error('ERROR: The ID for channel 1 and channel 2 are the same.')
    process.exit()
  }
  if (!channel1.permissionsFor(channel1.guild.me).has('VIEW_CHANNEL')) {
    console.error('ERROR: Bot does not have VIEW_CHANNEL permission for channel 1.')
    process.exit()
  }
  if (!channel2.permissionsFor(channel1.guild.me).has('VIEW_CHANNEL')) {
    console.error('ERROR: Bot does not have VIEW_CHANNEL permission for channel 2.')
    process.exit()
  }
  return true;
}

client.login(config.bot_token)
  .catch(() => {
    console.error('ERROR: The bot token you provided was incorrect. Please enter a correct bot token in the config file.')
    process.exit()
  })
