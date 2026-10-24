const express = require("express")
const { FalconConnection } = require("./connection")
const { loadPlugins, handleMessages } = require("./main")
const config = require("./config")
require("dotenv").config()

const app = express()
app.use(express.static("public"))
app.use(express.json())

let globalSock = null

async function start() {
  const sock = await FalconConnection()
  globalSock = sock
  loadPlugins(sock)
  handleMessages(sock)

  sock.ev.on("connection.update", (u) => {
    if(u.connection === "open") console.log(`${config.botName} Connected - ${config.banner}`)
  })
}

start()

// PUBLIC PAIRING ROUTE - EVERYONE CAN PAIR
app.get("/pair", async (req,res) => {
  const number = req.query.number
  if(!number) return res.json({error:"Number required"})
  if(!globalSock) return res.json({error:"Bot not ready, wait 10sec"})
  try{
    const clean = number.replace(/[^0-9]/g,"")
    const code = await globalSock.requestPairingCode(clean)
    res.json({code: code}) // Real 8 digit
  }catch(e){
    res.json({error: e.message})
  }
})

app.listen(config.port, () => console.log(`THE FALCON PAIR SITE LIVE ON PORT ${config.port}`))
