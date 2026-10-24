const config = require("../config")

module.exports = {
  name: "menu",
  execute: async (sock, m, args) => {
    const pushname = m.pushName || "Falcon User"
    
    const menuCaption = `
${config.banner}
*THE FALCON MD 🦅* 
*THE BEAST HAS LANDED*

┏━━━━━━━━━━━━━━━━━┓
┃ *Owner:* ${config.ownerName}
┃ *Number:* ${config.ownerNumber}
┃ *Prefix:* [ ${config.prefix} ]
┃ *User:* ${pushname}
┃ *Mode:* Public Pair
┗━━━━━━━━━━━━━━━━━┛

${config.banner}
*MAIN MENU*

┏━ *GENERAL* ━┓
┃ • ${config.prefix}menu
┃ • ${config.prefix}ping
┃ • ${config.prefix}alive
┃ • ${config.prefix}owner
┃ • ${config.prefix}channel
┃ • ${config.prefix}group
┃ • ${config.prefix}runtime
┗━━━━━━━━━━━━━┛

┏━ *GROUP* ━┓
┃ • ${config.prefix}kick
┃ • ${config.prefix}add
┃ • ${config.prefix}promote
┃ • ${config.prefix}demote
┃ • ${config.prefix}tagall
┃ • ${config.prefix}hidetag
┃ • ${config.prefix}antilink
┃ • ${config.prefix}welcome
┗━━━━━━━━━━━━┛

┏━ *OWNER* ━┓
┃ • ${config.prefix}ban
┃ • ${config.prefix}unban
┃ • ${config.prefix}broadcast
┃ • ${config.prefix}restart
┃ • ${config.prefix}setpp
┃ • ${config.prefix}setname
┗━━━━━━━━━━━┛

┏━ *ANTI CRASH* ━┓
┃ • ${config.prefix}antibug
┃ • ${config.prefix}antiview
┃ • ${config.prefix}antidelete
┗━━━━━━━━━━━━━━━┛

*TOTAL PLUGINS:* 50+

${config.banner}
*CHANNEL:* ${config.channel}
*GROUP:* ${config.group}

_Powered by ${config.ownerName}_
${config.banner}
`

    await sock.sendMessage(m.key.remoteJid, { 
      image: { url: config.botPic },
      caption: menuCaption,
      contextInfo: {
        externalAdReply: {
          title: config.pairingTitle,
          body: "THE FALCON PAIR SITE",
          thumbnailUrl: config.botPic,
          mediaType: 1,
          sourceUrl: config.channel
        }
      }
    }, { quoted: m })
  }
}
