#!/usr/bin/env node

const { Command } = require('commander')
const path = require('path')
const pkg = require('../package.json')
const fs = require('fs')
const defaultConfig = require('./default.config')
const Generator = require('../src/generator')
const { init } = require('../src/init')
const OssUploader = require('../src/oss')
const GithubUploader = require('../src/github')
const {
  getUserConfig,
  errorLog,
  checkFileExist,
  commandKey,
  commandTip,
  commandSettingMap,
  commandInit,
  commandDraw,
  commandOss,
  commandGithub
} = require('../src/util')

const userDir = process.cwd()
const program = new Command()

const userConfigPath = path.resolve(userDir, defaultConfig.configFileName)
const userConfigExist = checkFileExist(userConfigPath)

program.name(pkg.name).description(pkg.description).version(pkg.version)
program
  .command(commandSettingMap[commandInit][commandKey])
  .description('Initialize the generated configuration file')
  .action(() => {
    init(userConfigPath, defaultConfig.configFileName)
  })

program
  .command(commandSettingMap[commandDraw][commandKey])
  .description('Randomly output cloud images based on your input file')
  .argument('<filePath>', 'Keyword cloud map will be automatically generated according to the configuration file')
  .action(filePath => {
    if (!userConfigExist) return errorLog(commandSettingMap[commandDraw][commandTip])
    new Generator(filePath, userDir, getUserConfig(userConfigPath)).draw()
  })

program
  .command(commandSettingMap[commandOss][commandKey])
  .description('Upload the specified image to Aliyun')
  .argument('<filePath>', 'Specify the uploaded image path')
  .action(filePath => {
    if (!userConfigExist) return errorLog(commandSettingMap[commandOss][commandTip])
    new OssUploader(filePath, userDir, getUserConfig(userConfigPath)).upload()
  })

program
  .command(commandSettingMap[commandGithub][commandKey])
  .description('Upload the specified image to Github')
  .argument('<filePath>', 'Specify the uploaded image path')
  .action(filePath => {
    if (!userConfigExist) return errorLog(commandSettingMap[commandGithub][commandTip])
    new GithubUploader(filePath, userDir, userConfigPath, getUserConfig(userConfigPath)).upload()
  })

program.parse()
