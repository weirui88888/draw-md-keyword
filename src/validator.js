const fs = require('fs')
const path = require('path')
const {
  errorLog,
  commandTip,
  commandFileUnExistTip,
  commandFileExtNameUnAllowTip,
  commandFileExtName,
  commandSettingMap
} = require('./util')

class Validator {
  constructor({ commandKey, filePath, configFileName, extName }) {
    this.commandKey = commandKey
    this.userDir = process.cwd()
    this.filePath = filePath
    this.configFileName = configFileName
    this.extName = extName
    this.allowExtNames = commandSettingMap[this.commandKey][commandFileExtName]
    this.userConfigPath = path.resolve(this.userDir, this.configFileName)
    this.fileTypePath = path.resolve(this.userDir, this.filePath)
    this.valid = this.validate()
  }

  validate() {
    let valid = true
    if (!this.verifyExtName(this.fileTypePath)) {
      errorLog(commandSettingMap[this.commandKey][commandFileExtNameUnAllowTip](this.fileTypePath))
      valid = false
    }
    if (!this.verifyFileExist(this.userConfigPath)) {
      errorLog(commandSettingMap[this.commandKey][commandTip])
      valid = false
    }
    if (!this.verifyFileExist(this.fileTypePath)) {
      errorLog(commandSettingMap[this.commandKey][commandFileUnExistTip](this.fileTypePath))
      valid = false
    }
    return valid
  }

  verifyFileExist(filePath) {
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      return false
    }
  }

  verifyExtName(filePath) {
    const extname = path.extname(filePath).split('.')[1]
    return this.allowExtNames.includes(extname)
  }
}

module.exports = Validator
