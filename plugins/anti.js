module.exports = {
  name: "anti",
  commands: ["antilink","antibot","antispam","antitag"],
  execute: async (sock, m, args) => {
    const cmd = m.body.split(" ")[0].replace("!","").toLowerCase()
    global[cmd] = args[0]
    let msg = cmd==="antilink" ? `Antilink set to ${args[0]} (ban/warn/kick)` : `${cmd} ${args[0]}`
    await sock.sendMessage(m.key.remoteJid, {text: msg}, {quoted: m})
  }
}
