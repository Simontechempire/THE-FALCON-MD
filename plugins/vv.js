module.exports = {
  name: "vv",
  commands: ["vv","vv2"],
  execute: async (sock, m) => {
    let q = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2 || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2Extension
    if(!q) return await sock.sendMessage(m.key.remoteJid, {text: "Reply to View Once"}, {quoted: m})
    await sock.sendMessage(m.key.remoteJid, {forward: q.message || q}, {quoted: m})
  }
}
