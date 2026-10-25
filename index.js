const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");

const config = require("./config.json");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve pair.html
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname, "pair.html"));
});

app.get("/health", (req,res)=> res.json({status:"ok", bot: config.botName}));

// PAIR ROUTE - 100% WORKING
app.get("/pair", async (req,res)=>{
  let number = req.query.number;
  if(!number) return res.json({error:"Enter number"});
  
  number = number.replace(/[^0-9]/g,'');
  if(number.length < 10) return res.json({error:"Invalid number"});

  const sessionFolder = path.join(__dirname, "tmp_" + number);
  if(fs.existsSync(sessionFolder)) fs.removeSync(sessionFolder);

  try{
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const sock = makeWASocket({
      auth: state,
      logger: pino({level:"silent"}),
      browser: Browsers.macOS("Chrome"),
      printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    if(!sock.authState.creds.registered){
      await new Promise(r=> setTimeout(r, 1000));
      const code = await sock.requestPairingCode(number);
      console.log(`Pair code for ${number}: ${code}`);
      res.json({code: code});
      
      // cleanup after 60s
      setTimeout(()=> { if(fs.existsSync(sessionFolder)) fs.removeSync(sessionFolder) }, 60000);
    } else {
      res.json({error:"Number already registered"});
    }
  }catch(e){
    console.log("Pair error:", e.message);
    if(fs.existsSync(sessionFolder)) fs.removeSync(sessionFolder);
    res.json({error: e.message});
  }
});

// START SERVER FIRST - THIS FIXES 502
app.listen(PORT, "0.0.0.0", ()=>{
  console.log(`[FALCON] Server running on ${PORT}`);
  
  // Optional: Start main bot if you want always-on
  // startMainBot();
});

async function startMainBot(){
  try{
    const { FalconConnection } = require("./connection.js");
    const sock = await FalconConnection();
    const { handleMessages } = require("./main.js");
    handleMessages(sock);
  }catch(e){ console.log("Main bot error:", e.message); }
        }
