const fs = require('fs')
const { initConfig } = require('../bin/default.config')
const { Log } = require('./util')

const init = (userConfigPath, configFileName) => {
  if (fs.existsSync(userConfigPath)) {
    return Log(`[${configFileName}] had already been created! you can edit it and then run 'dmk draw <md filePath>'`)
  }

  fs.writeFile(userConfigPath, initConfig(), err => {
    if (err) throw err
    Log(`[${configFileName}] had already been created! you can edit it and then run 'dmk draw <md filePath>'`)
  })
}

exports.init = init
