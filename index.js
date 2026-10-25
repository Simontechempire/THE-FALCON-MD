const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const pairHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>THE FALCON PAIR SITE</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif}body{background:#0a0a0a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:100%;max-width:400px;background:#111;padding:30px;border-radius:24px;text-align:center;border:1px solid #222}.logo{width:120px;height:120px;border-radius:50%;border:3px solid #00ff99}input{width:100%;padding:15px;border-radius:12px;border:1px solid #222;background:#000;color:#fff;margin-top:15px;font-size:16px}.main{width:100%;padding:15px;border:none;border-radius:12px;background:#00ff99;color:#000;font-weight:800;margin-top:15px;cursor:pointer}#codeBox{display:none;margin-top:20px;background:#000;border:1px dashed #00ff99;padding:15px;border-radius:12px}#code{font-size:30px;font-weight:800;letter-spacing:6px;color:#00ff99}</style></head><body><div class="card"><img class="logo" src="https://files.catbox.moe/90v8t7.png"><h1>THE FALCON PAIR</h1><input id="number" placeholder="2348122029123"><button class="main" id="btn" onclick="getCode()">GET CODE</button><div id="codeBox"><div id="code">--------</div></div><p id="msg" style="margin-top:10px;font-size:12px;color:#888"></p></div><script>async function getCode(){let n=document.getElementById('number').value.replace(/[^0-9]/g,'');if(n.length<11){alert('Enter full number with country code');return}let b=document.getElementById('btn');let c=document.getElementById('code');let box=document.getElementById('codeBox');let m=document.getElementById('msg');b.innerText='GENERATING...';box.style.display='block';c.innerText='...';try{let r=await fetch('/pair?number='+n);let d=await r.json();if(d.code){c.innerText=d.code;m.innerText='WhatsApp > Linked Devices > Link with phone number';b.innerText='GENERATED ✓'}else{c.innerText='FAILED';m.innerText=d.error;b.innerText='TRY AGAIN'}}catch(e){c.innerText='ERROR';b.innerText='TRY AGAIN'}}</script></body></html>`;

app.get("/", (req,res)=> res.send(pairHtml));

app.get("/pair", async (req,res)=>{
  let number = (req.query.number || "").replace(/[^0-9]/g,'');
  console.log("Request pair for:", number);
  if(!number || number.length < 10) return res.json({error:"Invalid number, use 234..."});
  
  const dir = path.join(__dirname, "tmp_" + number + "_" + Date.now());
  if(fs.existsSync(dir)) fs.removeSync(dir);

  try{
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({level:"fatal"}))
      },
      logger: pino({level:"fatal"}),
      browser: Browsers.macOS("Desktop"),
      printQRInTerminal: false,
      syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    // IMPORTANT: Wait for socket to initialize
    await new Promise(r=> setTimeout(r, 3000));

    if(sock.authState.creds.registered){
      fs.removeSync(dir);
      return res.json({error:"Already paired"});
    }

    const code = await sock.requestPairingCode(number);
    console.log("CODE:", number, code);
    if(!code) throw new Error("No code returned");
    
    res.json({code: code});

    setTimeout(()=> { try{fs.removeSync(dir)}catch{} }, 30000);

  }catch(e){
    console.log("Pair fail:", e.message);
    try{fs.removeSync(dir)}catch{}
    res.json({error: e.message || "Failed to get code, try again in 10s. Make sure number is not already linked."});
  }
});

app.listen(PORT, "0.0.0.0", ()=> console.log("FALCON RUNNING ON", PORT));
