module.exports = {
  name: "auto",
  commands: ["autoread","autotyping","autorecording","autolikestatus","autoreply","welcome","goodbye","autostatus","autoreact"],
  execute: async (sock, m, args) => {
    const cmd = m.body.split(" ")[0].replace("!","").toLowerCase()
    global[cmd] = args[0]=="on"
    await sock.sendMessage(m.key.remoteJid, {text: `*${cmd}* is now ${args[0]}`}, {quoted: m})
  }
}
