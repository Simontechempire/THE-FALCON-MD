const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const config = require("./config.json");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// INLINE HTML - NO FILE NEEDED, FIXES ENOENT
const pairHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>THE FALCON PAIR SITE</title><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Outfit',sans-serif}body{background:radial-gradient(circle at top,#0f2b1f 0%,#0a0a0a 60%);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:100%;max-width:420px;background:rgba(17,17,17,0.9);padding:30px 25px;border-radius:28px;box-shadow:0 0 0 1px #1a1a1a,0 0 40px rgba(0,255,153,0.15);text-align:center}.logo{width:130px;height:130px;border-radius:50%;border:3px solid #00ff99}.main{width:100%;padding:16px;border:none;border-radius:14px;background:#00ff99;color:#000;font-weight:800;font-size:16px;margin-top:16px;cursor:pointer}input{width:100%;padding:16px;border-radius:14px;border:1px solid #222;background:#0f0f0f;color:#fff;font-size:16px}#codeBox{display:none;margin-top:22px;background:#0f0f0f;border:1px dashed #00ff99;border-radius:16px;padding:18px}#code{font-size:32px;font-weight:800;letter-spacing:8px;color:#00ff99}</style></head><body><div class="card"><img class="logo" src="https://files.catbox.moe/90v8t7.png"><h1>THE FALCON PAIR SITE</h1><p style="color:#888;font-size:13px;margin-bottom:20px">The Falcon MD • Fast & Secure Pairing</p><input id="number" placeholder="2348122029123"><button class="main" id="btn" onclick="getCode()">GET 8-DIGIT CODE</button><div id="codeBox"><div id="code">--------</div><p style="font-size:12px;color:#aaa;margin-top:8px">WhatsApp > Linked Devices > Link with Phone Number</p><button style="margin-top:10px;padding:10px 15px;border-radius:8px" onclick="navigator.clipboard.writeText(document.getElementById('code').innerText)">COPY CODE</button></div></div><script>async function getCode(){let num=document.getElementById('number').value.replace(/[^0-9]/g,'');if(num.length<10){alert('Enter valid number');return}document.getElementById('btn').innerText='GENERATING...';document.getElementById('codeBox').style.display='block';document.getElementById('code').innerText='WAITING...';try{const res=await fetch('/pair?number='+num);const data=await res.json();if(data.code){document.getElementById('code').innerText=data.code;document.getElementById('btn').innerText='CODE GENERATED ✓'}else{document.getElementById('code').innerText='FAILED';alert(data.error);document.getElementById('btn').innerText='TRY AGAIN'}}catch(e){document.getElementById('code').innerText='ERROR';document.getElementById('btn').innerText='TRY AGAIN'}}</script></body></html>`;

app.get("/", (req,res)=> res.send(pairHtml));
app.get("/health", (req,res)=> res.json({status:"ok"}));

app.get("/pair", async (req,res)=>{
  let number = req.query.number?.replace(/[^0-9]/g,'');
  if(!number || number.length < 10) return res.json({error:"Invalid number"});
  const sessionFolder = path.join(__dirname, "tmp_" + number);
  if(fs.existsSync(sessionFolder)) fs.removeSync(sessionFolder);
  try{
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const sock = makeWASocket({auth: state, logger: pino({level:"silent"}), browser: Browsers.macOS("Chrome"), printQRInTerminal:false});
    sock.ev.on("creds.update", saveCreds);
    if(!sock.authState.creds.registered){
      await new Promise(r=> setTimeout(r,1200));
      const code = await sock.requestPairingCode(number);
      res.json({code});
      setTimeout(()=> fs.existsSync(sessionFolder) && fs.removeSync(sessionFolder), 60000);
    }else res.json({error:"Already registered"});
  }catch(e){ if(fs.existsSync(sessionFolder)) fs.removeSync(sessionFolder); res.json({error:e.message}); }
});

app.listen(PORT, "0.0.0.0", ()=> console.log(`[FALCON] Live on ${PORT}`));
