#!/usr/bin/env node

const { Command } = require('commander')
const path = require('path')
const pkg = require('../package.json')
const fs = require('fs')
const defaultConfig = require('./default.config')
const Generator = require('../src/generator')
const { init } = require('../src/init')
const OssUploader = require('../src/oss')
const { getUserConfig, errorLog } = require('../src/util')

const userDir = process.cwd()
const program = new Command()

const userConfigPath = path.resolve(userDir, defaultConfig.configFileName)

program.name(pkg.name).description(pkg.description).version(pkg.version)
program
  .command('init')
  .description('Initialize the generated configuration file')
  .action(() => {
    init(userConfigPath, defaultConfig.configFileName)
  })

program
  .command('draw')
  .description('Randomly output cloud images based on your input file')
  .argument('<filePath>', 'Keyword cloud map will be automatically generated according to the configuration file')
  .action(filePath => {
    // TODO:移到Generator里面
    if (!fs.existsSync(userConfigPath)) {
      return errorLog(`please run 'dmk init' to initialize a config file before use [dwk draw]`)
    }
    new Generator(filePath, userDir, getUserConfig(userConfigPath)).draw()
  })

program
  .command('oss')
  .description('Upload the specified image to Aliyun')
  .argument('<filePath>', 'Specify the uploaded image path')
  .action(filePath => {
    new OssUploader(filePath, userDir, getUserConfig(userConfigPath)).upload()
  })

program.parse()
