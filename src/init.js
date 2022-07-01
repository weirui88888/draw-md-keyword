const fs = require('fs')
const chalk = require('chalk')
const { initConfig } = require('../bin/default.config')
const { generateOra, sleep } = require('./util')

const init = async (userConfigPath, configFileName) => {
  const initOra = generateOra({
    spinner: 'monkey',
    text: `dmk配置文件${chalk.green(configFileName)}正在生成中...`
  })
  initOra.start()
  await sleep(2)
  if (fs.existsSync(userConfigPath)) {
    return initOra.succeed(
      `[ ${configFileName} ] had already been created! you can edit it and then run ${chalk.green('dmk draw <md filePath>')}`
    )
  }
  fs.writeFile(userConfigPath, initConfig(), err => {
    if (err) {
      initOra.fail(err.message)
      throw err
    }
    initOra.succeed(
      `[ ${configFileName} ] had already been created! you can edit it and then run ${chalk.green('dmk draw <md filePath>')}`
    )
  })
}

exports.init = init
