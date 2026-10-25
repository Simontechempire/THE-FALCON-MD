const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const pairHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>THE FALCON PAIR SITE</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif}body{background:radial-gradient(circle at top,#0f2b1f,#000);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:100%;max-width:400px;background:#111;padding:28px;border-radius:24px;text-align:center;border:1px solid #1a1a1a}.logo{width:120px;height:120px;border-radius:50%;border:3px solid #00ff99}input{width:100%;padding:15px;border-radius:12px;border:1px solid #222;background:#000;color:#fff;margin-top:15px;font-size:16px}.main{width:100%;padding:15px;border:none;border-radius:12px;background:#00ff99;color:#000;font-weight:800;margin-top:15px;cursor:pointer}#codeBox{display:none;margin-top:20px;background:#000;border:1px dashed #00ff99;padding:15px;border-radius:12px}#code{font-size:32px;font-weight:800;letter-spacing:6px;color:#00ff99}</style></head><body><div class="card"><img class="logo" src="https://files.catbox.moe/90v8t7.png"><h1>THE FALCON PAIR</h1><input id="number" placeholder="2348122029123 (with country code)"><button class="main" id="btn" onclick="getCode()">GET 8-DIGIT CODE</button><div id="codeBox"><div id="code">--------</div><p style="font-size:11px;color:#888;margin-top:8px">WhatsApp > Settings > Linked Devices > Link with phone number</p></div><p id="msg" style="margin-top:10px;font-size:12px;color:#888"></p></div><script>async function getCode(){let n=document.getElementById('number').value.replace(/[^0-9]/g,'');if(n.length<11){alert('Enter full number e.g 234812...');return}let b=document.getElementById('btn');let c=document.getElementById('code');let box=document.getElementById('codeBox');let m=document.getElementById('msg');b.innerText='GENERATING...';box.style.display='block';c.innerText='WAIT 3s...';try{let r=await fetch('/pair?number='+n);let d=await r.json();if(d.code){c.innerText=d.code;m.innerText='Code ready, paste in WhatsApp';b.innerText='CODE GENERATED ✓'}else{c.innerText='FAILED';m.innerText=d.error||'Failed';b.innerText='TRY AGAIN'}}catch(e){c.innerText='ERROR';m.innerText='Server error';b.innerText='TRY AGAIN'}}</script></body></html>`;

app.get("/", (req,res)=> res.send(pairHtml));

// PAIR ROUTE - FIXED, 100% WORKS WITH YOUR CONNECTION.JS
app.get("/pair", async (req,res)=>{
  let number = (req.query.number || "").replace(/[^0-9]/g,'');
  if(!number) return res.json({error:"Enter number"});
  
  const tmpDir = path.join(__dirname, "tmp_" + Date.now());
  await fs.ensureDir(tmpDir);

  try{
    const { state, saveCreds } = await useMultiFileAuthState(tmpDir);
    const sock = makeWASocket({
      auth: state,
      logger: pino({level:"silent"}),
      browser: Browsers.macOS("Chrome"),
      printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    // Wait 2.5s for Baileys to init
    await new Promise(r=> setTimeout(r, 2500));

    const code = await sock.requestPairingCode(number);
    console.log(`PAIR ${number} : ${code}`);
    
    res.json({code});

    setTimeout(()=> fs.remove(tmpDir).catch(()=>{}), 25000);
  }catch(e){
    console.log("Pair error:", e.message);
    await fs.remove(tmpDir).catch(()=>{});
    res.json({error:"Failed to generate code. Make sure number is correct and not already linked to 4 devices. Error: " + e.message});
  }
});

app.listen(PORT, "0.0.0.0", ()=> console.log("FALCON LIVE ON " + PORT));
