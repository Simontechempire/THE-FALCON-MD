const { default: makeWASocket, useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const pino = require("pino")
const config = require("./config.json")

async function FalconConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || "falcon_session")
  
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({level:"fatal"}))
    },
    logger: pino({level:"fatal"}), // ZERO LOGS = FASTEST
    browser: Browsers.macOS("Desktop"), // faster than Chrome
    printQRInTerminal: false,
    syncFullHistory: false, // DON'T SYNC HISTORY = INSTANT CONNECT
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    shouldSyncHistoryMessage: () => false,
    getMessage: async () => undefined
  })

  sock.ev.on("creds.update", saveCreds)
  
  return sock
}

module.exports = { FalconConnection }
