#!/usr/bin/env node

const { Command } = require("commander")
const path = require("path")
const pkg = require("../package.json")
const defaultConfig = require("./default.config")
const Generator = require("../src/generator")
const { init } = require("../src/init")
const { getUserConfig, pickKeywords } = require("../src/util")

const userDir = process.cwd()
const program = new Command()
const userConfigPath = path.resolve(userDir, defaultConfig.configFileName)
program.name(pkg.name).description(pkg.version).version(pkg.version)
program
  .command("init")
  .description("Initialize the generated configuration file")
  .action(() => {
    init(userConfigPath, defaultConfig.configFileName)
  })

program
  .command("draw")
  .description("Randomly output cloud images based on your input file")
  .argument("<filePath>", "Keywords will be automatically generated based on the configured file")
  .action((filePath) => {
    const keywords = pickKeywords(path.resolve(userDir, filePath))
    new Generator(keywords, getUserConfig(userConfigPath)).draw()
  })

program.parse()
