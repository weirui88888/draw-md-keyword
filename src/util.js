const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const log = console.log
const commonMark = require('commonMark')

const { keywordPadding, codeType, strongType, supportDrawType, canvasSetting } = require('./const')

const happyLog = message => {
  log(chalk.green(message))
}

const errorLog = message => {
  log(chalk.red(message))
}

const sleep = time => {
  return new Promise(res => {
    setTimeout(() => {
      res()
    }, time * 1000)
  })
}

const generateOra = option => {
  return ora(option)
}

const formatDate = (date, format) => {
  const map = {
    mm: date.getMonth() + 1,
    dd: date.getDate(),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear()
  }

  return format.replace(/mm|dd|(yyyy|yy)/gi, matched => {
    return map[matched]
  })
}

const getMarkDownName = (filePath, format) => {
  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    const dirnamePath = path.dirname(fullPath)
    const markDownName = fullPath.replace(`${dirnamePath}/`, '').split('.')[0]
    return `${formatDate(new Date(), format)}-${markDownName}`
  } catch (error) {
    errorLog(error.message)
    return Date.now()
  }
}

const getUserConfig = path => {
  if (!fs.existsSync(path)) {
    return errorLog(`please run 'dmk init' to initialize a config file`)
  }
  return require(path)
}

const parseMarkDownKeyword = (markdown, types = supportDrawType) => {
  let parsed = new commonMark.Parser().parse(markdown)
  let walker = parsed.walker()
  let event
  let codeNodes = []
  let strongNodes = []
  while ((event = walker.next())) {
    let node = event.node
    if (node.type === codeType && node.literal && types.includes(codeType)) {
      codeNodes.push(node)
    }
    if (node.type === strongType && node.firstChild._literal && types.includes(strongType)) {
      strongNodes.push(node)
    }
  }

  const codeKeys = codeNodes.map(node => node.literal.trim())
  const strongKeys = strongNodes.map(node => node.firstChild.literal.trim())
  const allKeywords = [...new Set([...codeKeys, ...strongKeys])]
  return allKeywords
}

const pickKeywords = filePath => {
  const markdown = fs.readFileSync(filePath, { encoding: 'utf8' })
  return parseMarkDownKeyword(markdown)
}

const random = (min, max) => Math.floor(Math.random() * (max - min) + min)
const randomColor = () => {
  let r = random(0, 256)
  let g = random(0, 256)
  let b = random(0, 256)
  return `rgb(${r},${g},${b})`
}
const checkHex = hex => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)
const pickHex = hex => (checkHex(hex) ? hex : randomColor())
const checkBol = input => !!input
const verifyParam = (config, allowNon) => {
  const unValidKeys = []
  for (const paramKey in config) {
    if (!config[paramKey] && !allowNon.includes(paramKey)) {
      unValidKeys.push(paramKey)
    }
  }
  return unValidKeys
}
const verifyImage = url => {
  return new Promise((res, rej) => {
    const image = new Image()
    image.onload = () => {
      res({
        valid: true
      })
    }
    image.onerror = () => {
      rej({
        valid: false
      })
    }
    image.src = url
  })
}

const calculateKeywords = ({ fontSize, fontFamily, fontStyle, keywords, max, singleKeywordMaxLength, ctx }) => {
  const originKeywords = keywords.length > max ? keywords.splice(0, max) : keywords
  const handledKeywords = originKeywords.map(keyword => {
    return keyword.length > singleKeywordMaxLength ? `${keyword.substr(0, singleKeywordMaxLength)}...` : keyword
  })
  const applyKeywords = handledKeywords.map(keyword => {
    const fontRandomIndex = !!fontFamily ? canvasSetting.supportFonts.findIndex(font => font === fontFamily) : random(0, 5)
    const applyFont =
      fontStyle === canvasSetting.italicFontStyle ? canvasSetting.italicFontFamily : canvasSetting.supportFonts[fontRandomIndex]
    ctx.font = `${fontSize}px ${applyFont}`
    const width = ctx.measureText(keyword).width + keywordPadding
    return {
      width,
      circleRadius: width / 2,
      keyword,
      font:
        fontStyle === canvasSetting.italicFontStyle ? canvasSetting.italicFontFamily : canvasSetting.supportFonts[fontRandomIndex]
    }
  })
  return applyKeywords
}

const calculateOffsetX = (radius, width) => {
  return radius - width / 2 + keywordPadding / 2
}

const settingMap = {
  fontStyle: {
    allow: userSetting => canvasSetting.supportFontStyle.includes(userSetting),
    default: canvasSetting.defaultFontStyle
  },
  fontFamily: {
    allow: userSetting => canvasSetting.supportFonts.includes(userSetting),
    default: ''
  },
  theme: {
    allow: userSetting => canvasSetting.supportTheme.includes(userSetting),
    default: canvasSetting.defaultTheme
  },
  max: {
    allow: userSetting => /^\+?[1-9][0-9]*$/.test(userSetting),
    default: canvasSetting.defaultMax
  },
  singleKeywordMaxLength: {
    allow: userSetting => /^\+?[1-9][0-9]*$/.test(userSetting),
    default: canvasSetting.defaultSingleKeywordMaxLength
  },
  fontSize: {
    allow: userSetting => /^\+?[1-9][0-9]*$/.test(userSetting),
    default: canvasSetting.defaultFontSize
  },
  width: {
    allow: userSetting => /^\+?[1-9][0-9]*$/.test(userSetting),
    default: canvasSetting.defaultCanvasWidth
  },
  height: {
    allow: userSetting => /^\+?[1-9][0-9]*$/.test(userSetting),
    default: canvasSetting.defaultCanvasHeight
  }
}

const pickUserSetting = (userSetting, settingKey) => {
  return settingMap[settingKey].allow(userSetting) ? userSetting : settingMap[settingKey].default
}

const commandInit = 'init'
const commandDraw = 'draw'
const commandOss = 'oss'
const commandGithub = 'github'
const commandVerify = 'verify'
const commandAccessAllowKey = 'accessAllowKey'
const commandTypeUnMatchTip = 'accessTypeUnAllow'
const commandTip = 'tip'
const commandKey = 'key'
const commandFileUnExistTip = 'fileUnExist'
const commandFileExtName = 'extName'
const commandFileExtNameUnAllowTip = 'extNameUnAllow'
const commandSettingMap = {
  [commandInit]: {
    [commandKey]: commandInit
  },
  [commandDraw]: {
    [commandKey]: commandDraw,
    [commandTip]: "Please run 'dmk init' to initialize a config file before use [dwk draw]",
    [commandFileUnExistTip]: path => `${path} does not exist, please confirm and execute again`,
    [commandFileExtName]: ['md', 'MD'],
    [commandFileExtNameUnAllowTip]: path =>
      `${path} does not match this command, please confirm and execute again, ${chalk.green(
        'dwk draw command only supports extname with md or MD'
      )}`
  },
  [commandOss]: {
    [commandKey]: commandOss,
    [commandTip]: "Please run 'dmk init' to initialize a config file before use [dwk oss]",
    [commandFileUnExistTip]: path => `${path} does not exist, please confirm and execute again`,
    [commandFileExtName]: ['png'],
    [commandFileExtNameUnAllowTip]: path =>
      `${path} does not match this command, please confirm and execute again, ${chalk.green(
        'dwk oss command only supports extname with png'
      )}`
  },
  [commandGithub]: {
    [commandKey]: commandGithub,
    [commandTip]: "Please run 'dmk init' to initialize a config file before use [dwk github]",
    [commandFileUnExistTip]: path => `${path} does not exist, please confirm and execute again`,
    [commandFileExtName]: ['png'],
    [commandFileExtNameUnAllowTip]: path =>
      `${path} does not match this command, please confirm and execute again, ${chalk.green(
        'dwk github command only supports extname with png'
      )}`
  },
  [commandVerify]: {
    [commandKey]: commandVerify,
    [commandTip]: "Please run 'dmk init' to initialize a config file before use [dwk access]",
    [commandAccessAllowKey]: ['oss', 'github'],
    [commandTypeUnMatchTip]: 'type param only support oss or github'
  }
}

const checkFileExist = filePath => {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

const calculateMainAuthorPoint = (authorPointX, authorPointY, authorWidth, authorHeight) => {
  const pointTopLeft = [authorPointX, authorPointY]
  const pointTopCenter = [authorPointX + authorWidth / 2, authorPointY]
  const pointTopRight = [authorPointX + authorWidth, authorPointY]

  const pointMiddleLeft = [authorPointX, authorPointY + authorHeight / 2]
  const pointMiddleCenter = [authorPointX + authorWidth / 2, authorPointY + authorHeight / 2]
  const pointMiddleRight = [authorPointX + authorWidth, authorPointY + authorHeight / 2]

  const pointBottomLeft = [authorPointX, authorPointY + authorHeight]
  const pointBottomCenter = [authorPointX + authorWidth / 2, authorPointY + authorHeight]
  const pointBottomRight = [authorPointX + authorWidth, authorPointY + authorHeight]

  const pointBlockTopLeft = [authorPointX + authorWidth / 4, authorPointY + authorHeight / 4]
  const pointBlockTopRight = [authorPointX + (authorWidth / 4) * 3, authorPointY + authorHeight / 4]

  const pointBlockBottomLeft = [authorPointX + authorWidth / 4, authorPointY + (authorHeight / 4) * 3]
  const pointBlockBottomRight = [authorPointX + (authorWidth / 4) * 3, authorPointY + (authorHeight / 4) * 3]
  return [
    pointTopLeft,
    pointTopCenter,
    pointTopRight,
    pointMiddleLeft,
    pointMiddleCenter,
    pointMiddleRight,
    pointBottomLeft,
    pointBottomCenter,
    pointBottomRight,
    pointBlockTopLeft,
    pointBlockTopRight,
    pointBlockBottomLeft,
    pointBlockBottomRight
  ]
}

exports.getUserConfig = getUserConfig
exports.happyLog = happyLog
exports.errorLog = errorLog
exports.log = log
exports.sleep = sleep
exports.generateOra = generateOra
exports.pickKeywords = pickKeywords
exports.random = random
exports.randomColor = randomColor
exports.checkHex = checkHex
exports.pickHex = pickHex
exports.checkBol = checkBol
exports.verifyParam = verifyParam
exports.verifyImage = verifyImage
exports.calculateKeywords = calculateKeywords
exports.calculateOffsetX = calculateOffsetX
exports.getMarkDownName = getMarkDownName
exports.pickUserSetting = pickUserSetting
exports.checkFileExist = checkFileExist
exports.calculateMainAuthorPoint = calculateMainAuthorPoint
exports.commandSettingMap = commandSettingMap
exports.commandTip = commandTip
exports.commandFileUnExistTip = commandFileUnExistTip
exports.commandFileExtName = commandFileExtName
exports.commandFileExtNameUnAllowTip = commandFileExtNameUnAllowTip
exports.commandKey = commandKey
exports.commandInit = commandInit
exports.commandDraw = commandDraw
exports.commandOss = commandOss
exports.commandGithub = commandGithub
exports.commandVerify = commandVerify
exports.commandAccessAllowKey = commandAccessAllowKey
exports.commandTypeUnMatchTip = commandTypeUnMatchTip
