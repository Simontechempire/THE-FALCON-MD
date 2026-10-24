module.exports = {
  name: "group",
  commands: ["tagall","kick","add","promote","demote","group","listmember","gcstatus","kickall"],
  execute: async (sock, m, args) => {
    const cmd = m.body.split(" ")[0].replace("!","").toLowerCase()
    const jid = m.key.remoteJid
    if(cmd==="tagall"){ let g=await sock.groupMetadata(jid); let members=g.participants.map(p=>p.id); return await sock.sendMessage(jid,{text:args.join(" ")||"Tagall",mentions:members},{quoted:m}) }
    if(cmd==="kick"){ let u=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; return await sock.groupParticipantsUpdate(jid,[u],"remove") }
    if(cmd==="add"){ let num=args[0]+"@s.whatsapp.net"; return await sock.groupParticipantsUpdate(jid,[num],"add") }
    if(cmd==="promote"){ let u=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; return await sock.groupParticipantsUpdate(jid,[u],"promote") }
    if(cmd==="demote"){ let u=m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; return await sock.groupParticipantsUpdate(jid,[u],"demote") }
    if(cmd==="group"){ let act=args[0]=="open"?"not_announcement":"announcement"; return await sock.groupSettingUpdate(jid,act) }
    if(cmd==="listmember"){ let g=await sock.groupMetadata(jid); let txt=g.participants.map((p,i)=>`${i+1}. @${p.id.split("@")[0]}`).join("\n"); return await sock.sendMessage(jid,{text:txt,mentions:g.participants.map(p=>p.id)},{quoted:m}) }
    if(cmd==="gcstatus"){ let g=await sock.groupMetadata(jid); return await sock.sendMessage(jid,{text:`*${g.subject}*\nMembers: ${g.participants.length}`},{quoted:m}) }
    if(cmd==="kickall"){ let g=await sock.groupMetadata(jid); let ids=g.participants.filter(p=>!p.admin).map(p=>p.id); return await sock.groupParticipantsUpdate(jid,ids,"remove") }
  }
}
