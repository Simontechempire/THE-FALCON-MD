const config = require("./config.json")
config.port = process.env.PORT || 3000

const express = require("express")
const app = express()

app.get("/", (req,res)=> {
  res.send(`${config.botName} - Active on ${config.port}`)
})

app.listen(config.port, async ()=>{
  console.log(`${config.botName} Server running on port ${config.port}`)
  const { FalconConnection } = require("./connection.js")
  const sock = await FalconConnection()
  const { handleMessages } = require("./main.js")
  handleMessages(sock)
})
