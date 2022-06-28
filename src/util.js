const fs = require("fs")
const chalk = require("chalk")
const log = console.log

const greenLog = (message) => {
  log(chalk.green(message))
}

const redLog = (message) => {
  log(chalk.red(message))
}

const getUserConfig = (path) => {
  if (!fs.existsSync(path)) {
    return redLog(`please run 'dk init' to initialize a config file`)
  }
  return require(path)
}

const pickKeywords = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return redLog(`${filePath} does not exist, please confirm and execute again `)
  }
  const mdContent = fs.readFileSync(filePath, { encoding: "utf8" })
  console.log(mdContent)
  // return mdContent
}

exports.getUserConfig = getUserConfig
exports.greenLog = greenLog
exports.redLog = redLog
exports.pickKeywords = pickKeywords
