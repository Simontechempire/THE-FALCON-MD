const config = require("../config")
const fs = require("fs")

module.exports = {
  name: "owner",
  commands: ["owner","setowner","restart","shutdown","broadcast","join","leave","setprefix","block","unblock","pair","getsession","clearsession","setppbot","setbio","setname","banuser","unbanuser","addsudo"],
  
  execute: async (sock, m, args) => {
    const cmd = m.body ? m.body.split(" ")[0].replace(config.prefix,"").toLowerCase() : "owner"
    const text = args.join(" ")
    const jid = m.key.remoteJid

    // 1. owner
    if(cmd === "owner"){
      return await sock.sendMessage(jid, { 
        image: {url: config.botPic},
        caption: `*THE FALCON MD OWNER*\nName: ${config.ownerName}\nNumber: ${config.ownerNumber}\nChannel: ${config.channel}` 
      }, {quoted: m})
    }

    // 2. setowner
    if(cmd === "setowner"){
      return await sock.sendMessage(jid, {text: `Owner set to ${text}`}, {quoted: m})
    }

    // 3. restart
    if(cmd === "restart"){
      await sock.sendMessage(jid, {text: "*THE FALCON MD Restarting...* 🦅"}, {quoted: m})
      process.exit(0)
    }

    // 4. shutdown
    if(cmd === "shutdown"){
      await sock.sendMessage(jid, {text: "*Shutting down...*"}, {quoted: m})
      process.exit(0)
    }

    // 5. broadcast
    if(cmd === "broadcast"){
      let groups = await sock.groupFetchAllParticipating()
      for(let id in groups){ await sock.sendMessage(id, {text: text}) }
      return await sock.sendMessage(jid, {text: `Sent to ${Object.keys(groups).length} groups`}, {quoted: m})
    }

    // 6. join
    if(cmd === "join"){
      let code = text.split("https://chat.whatsapp.com/")[1]
      await sock.groupAcceptInvite(code)
      return await sock.sendMessage(jid, {text: "Joined!"}, {quoted: m})
    }

    // 7. leave
    if(cmd === "leave"){
      return await sock.groupLeave(jid)
    }

    // 8. setprefix is in settings but handle here too
    if(cmd === "setprefix"){
      return await sock.sendMessage(jid, {text: `Prefix is ${config.prefix} - change in config.js`}, {quoted: m})
    }

    // 9. block
    if(cmd === "block"){
      let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      await sock.updateBlockStatus(user, "block")
      return await sock.sendMessage(jid, {text: "Blocked"}, {quoted: m})
    }

    // 10. unblock
    if(cmd === "unblock"){
      let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      await sock.updateBlockStatus(user, "unblock")
      return await sock.sendMessage(jid, {text: "Unblocked"}, {quoted: m})
    }

    // 11. pair
    if(cmd === "pair"){
      let num = text.replace(/[^0-9]/g,"")
      let code = await sock.requestPairingCode(num)
      return await sock.sendMessage(jid, {text: `*PAIR CODE: ${code}*`}, {quoted: m})
    }

    // 12. getsession
    if(cmd === "getsession"){
      return await sock.sendMessage(jid, {text: "Session in falcon_session folder"}, {quoted: m})
    }

    // 13. clearsession
    if(cmd === "clearsession"){
      fs.rmSync("falcon_session",{recursive:true,force:true})
      return await sock.sendMessage(jid, {text: "Session cleared"}, {quoted: m})
    }

    // 14. setppbot, setbio, setname, banuser, unbanuser, addsudo
    if(cmd === "setppbot") return await sock.sendMessage(jid, {text: "Reply to image with !setppbot"}, {quoted: m})
    if(cmd === "setbio"){ await sock.updateProfileStatus(text); return await sock.sendMessage(jid, {text: "Bio updated"}, {quoted: m}) }
    if(cmd === "setname"){ await sock.updateProfileName(text); return await sock.sendMessage(jid, {text: "Name updated"}, {quoted: m}) }
    if(cmd === "banuser") return await sock.sendMessage(jid, {text: `Banned ${text}`}, {quoted: m})
    if(cmd === "unbanuser") return await sock.sendMessage(jid, {text: `Unbanned ${text}`}, {quoted: m})
    if(cmd === "addsudo") return await sock.sendMessage(jid, {text: `Sudo added: ${text}`}, {quoted: m})
  }
}
