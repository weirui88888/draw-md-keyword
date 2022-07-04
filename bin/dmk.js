#!/usr/bin/env node

const { Command } = require('commander')
const path = require('path')
const pkg = require('../package.json')
const defaultConfig = require('./default.config')
const Generator = require('../src/generator')
const { init } = require('../src/init')
const OssUploader = require('../src/oss')
const GithubUploader = require('../src/github')
const Validator = require('../src/validator')
const {
  getUserConfig,
  commandKey,
  commandSettingMap,
  commandInit,
  commandDraw,
  commandOss,
  commandGithub
} = require('../src/util')

const userDir = process.cwd()
const program = new Command()

const configFileName = defaultConfig.configFileName

const userConfigPath = path.resolve(userDir, defaultConfig.configFileName)

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
    const { valid } = new Validator({
      filePath,
      commandKey: commandDraw,
      configFileName
    })
    valid && new Generator(filePath, userDir, getUserConfig(userConfigPath)).draw()
  })

program
  .command(commandSettingMap[commandOss][commandKey])
  .description('Upload the specified image to Aliyun')
  .argument('<filePath>', 'Specify the uploaded image path')
  .action(filePath => {
    const { valid } = new Validator({
      filePath,
      commandKey: commandOss,
      configFileName
    })
    valid && new OssUploader(filePath, userDir, userConfigPath, getUserConfig(userConfigPath)).upload()
  })

program
  .command(commandSettingMap[commandGithub][commandKey])
  .description('Upload the specified image to Github')
  .argument('<filePath>', 'Specify the uploaded image path')
  .action(filePath => {
    const { valid } = new Validator({
      filePath,
      commandKey: commandGithub,
      configFileName
    })
    valid && new GithubUploader(filePath, userDir, userConfigPath, getUserConfig(userConfigPath)).upload()
  })

program.parse()
