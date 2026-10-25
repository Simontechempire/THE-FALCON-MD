const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys")
const pino = require("pino")
const config = require("./config.json")

async function FalconConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || "falcon_session")
  
  const sock = makeWASocket({
    auth: state,
    logger: pino({level:"fatal"}), // NO LOGGING = FAST
    browser: Browsers.macOS("Desktop"), // FASTEST BROWSER
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000
  })
  
  sock.ev.on("creds.update", saveCreds)
  return sock
}

module.exports = { FalconConnection }
