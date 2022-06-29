const fs = require('fs')
const { initConfig } = require('../bin/default.config')
const { greenLog } = require('./util')

const init = (userConfigPath, configFileName) => {
  if (fs.existsSync(userConfigPath)) {
    return greenLog(`[${configFileName}] had already been created! you can edit it and then run 'dmk draw'`)
  }

  fs.writeFile(userConfigPath, initConfig(), err => {
    if (err) throw err
    greenLog(`[${configFileName}] had already been created! you can edit it and then run 'dmk draw'`)
  })
}

exports.init = init
