const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys")
const pino = require("pino")
const config = require("./config.json")

async function FalconConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || "falcon_session")
  const sock = makeWASocket({
    auth: state,
    logger: pino({level:"silent"}),
    browser: Browsers.macOS("Chrome"),
    printQRInTerminal: false
  })
  sock.ev.on("creds.update", saveCreds)
  return sock
}

module.exports = { FalconConnection }
