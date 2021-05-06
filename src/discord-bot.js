const Discord = require('discord.js')
const schedule = require('node-schedule');

const logger = require('./logger')

const BOT_TOKEN = 'ODM5ODIyNTY0MzYzOTkzMTMw.YJPPtg.sbY0HRIgHW37pjRijmyBV8aTZ34'
const GUILD_ID = '839823904604291092'
const REPORTS_CHANNEL_ID = '839825344021135360'
const GUEST_ROLE_ID = '839835322333528074'
const INTRODUCTIONS_CHANNEL_ID = '839824964026236969'

const start = () => {
  const bot = new Discord.Client({})
  bot.login(BOT_TOKEN)

  bot.on('ready', async (evt) => {
    logger.info(`Logged in as: ${bot.user.tag}.`)
    // Send weekly analytics report on Monday at 00:30.
    schedule.scheduleJob('30 0 * * 1', async () => {
      await sendAnalyticsReport(bot, 'weekly')
    })
    // Send daily analytics report every day at 00:30.
    schedule.scheduleJob('30 0 * * *', async () => {
      await sendAnalyticsReport(bot, 'daily')
    })
  })

  bot.on('message', async msg => {
    if (msg.content.startsWith('!intro ')) {
      if (msg.channel.id.toString() !== INTRODUCTIONS_CHANNEL_ID) {
        const introductionsChannelName = msg.guild.channels.resolve(INTRODUCTIONS_CHANNEL_ID).name
        return msg.reply(`Please use !intro command in the ${introductionsChannelName} channel!`)
      }

      const introMsg = msg.content.substring('!intro '.length).trim()
      const minMsgLength = 20
      if (introMsg.length < minMsgLength) {
        return msg.reply(`Please write introduction at least ${minMsgLength} characters long!`)
      }

      const member = msg.guild.member(msg.author)
      try {
        if (member.roles.cache.get(GUEST_ROLE_ID)) {
          await member.roles.remove(GUEST_ROLE_ID)
          return msg.reply('Nice getting to know you! You are no longer a guest and have full access, welcome!')
        }
      } catch (error) {
        return msg.reply(`Error: ${error}`)
      }
    }

    if (msg.content.startsWith('!analytics') && msg.channel.id.toString() === REPORTS_CHANNEL_ID) {
      if (msg.content.includes('weekly')) {
        await sendAnalyticsReport(bot, 'weekly')
      } else {
        await sendAnalyticsReport(bot, 'daily')
      }
    }
  })
}

module.exports = {
  start
}