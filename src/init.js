const fs = require('fs')
const { initConfig } = require('../bin/default.config')
const { happyLog } = require('./util')

const init = (userConfigPath, configFileName) => {
  if (fs.existsSync(userConfigPath)) {
    return happyLog(
      `[${configFileName}] had already been created! you can edit it and then run 'dmk draw <md filePath>'`
    )
  }

  fs.writeFile(userConfigPath, initConfig(), err => {
    if (err) throw err
    happyLog(`[${configFileName}] had already been created! you can edit it and then run 'dmk draw <md filePath>'`)
  })
}

exports.init = init
