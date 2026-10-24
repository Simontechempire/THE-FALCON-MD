const fs = require("fs")
const path = require("path")
const config = require("./config")

function loadPlugins(sock) {
  const pluginPath = path.join(__dirname, "plugins")
  if(!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath)
  
  fs.readdirSync(pluginPath).forEach(file => {
    if(file.endsWith(".js")){
      try{
        const plugin = require(path.join(pluginPath, file))
        console.log(`[PLUGIN] Loaded: ${file}`)
      }catch(e){ console.log("Plugin error "+file, e.message) }
    }
  })
}

async function handleMessages(sock) {
  sock.ev.on("messages.upsert", async ({messages}) => {
    const m = messages[0]
    if(!m.message || m.key.fromMe) return
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
    if(!body.startsWith(config.prefix)) return

    const args = body.slice(config.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    
    const pluginFile = path.join(__dirname, "plugins", command+".js")
    if(fs.existsSync(pluginFile)){
      const cmd = require(pluginFile)
      await cmd.execute(sock, m, args, config)
    }
  })
}

module.exports = { loadPlugins, handleMessages }
