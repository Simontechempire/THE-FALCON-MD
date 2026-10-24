// In main.js replace loadPlugins with:
function loadPlugins(){
  const plugins = {}
  fs.readdirSync("./plugins").forEach(file=>{
    const plugin = require(`./plugins/${file}`)
    if(plugin.commands){
      plugin.commands.forEach(c=> plugins[c]=plugin)
    } else {
      plugins[plugin.name]=plugin
    }
  })
  return plugins
}
