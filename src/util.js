const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const log = console.log
const commonMark = require('commonMark')

const keywordPadding = 10
const italicFontWeight = 900
const italicFontStyle = 'italic'
const italicFontFamily = 'Microsoft YaHei'
const supportFonts = ['paint', 'hollow', 'cartoon', 'brush', 'kai', 'newYork', 'cursive']
const otfFontFamily = ['newYork']

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

const parseMarkDownKeyword = (markdown, types = ['code', 'strong']) => {
  let parsed = new commonMark.Parser().parse(markdown)
  let walker = parsed.walker()
  let event
  let codeNodes = []
  let strongNodes = []
  while ((event = walker.next())) {
    let node = event.node
    if (node.type === 'code' && node.literal && types.includes('code')) {
      codeNodes.push(node)
    }
    if (node.type === 'strong' && node.firstChild._literal && types.includes('strong')) {
      strongNodes.push(node)
    }
  }

  const codeKeys = codeNodes.map(node => node.literal.trim())
  const strongKeys = strongNodes.map(node => node.firstChild.literal.trim())
  const allKeywords = [...new Set([...codeKeys, ...strongKeys])]
  return allKeywords
}

const pickKeywords = filePath => {
  if (!fs.existsSync(filePath)) {
    return errorLog(`${filePath} does not exist, please confirm and execute again `)
  }
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

const calculateKeywords = ({ fontSize, fontFamily, fontStyle, keywords, max, singleKeywordMaxLength, ctx }) => {
  const originKeywords = keywords.length > max ? keywords.splice(0, max) : keywords
  const handledKeywords = originKeywords.map(keyword => {
    return keyword.length > singleKeywordMaxLength ? `${keyword.substr(0, singleKeywordMaxLength)}...` : keyword
  })
  const applyKeywords = handledKeywords.map(keyword => {
    const fontRandomIndex = !!fontFamily ? supportFonts.findIndex(font => font === fontFamily) : random(0, 5)
    const applyFont = fontStyle === italicFontStyle ? italicFontFamily : supportFonts[fontRandomIndex]
    ctx.font = `${fontSize}px ${applyFont}`
    const width = ctx.measureText(keyword).width + keywordPadding
    return {
      width,
      circleRadius: width / 2,
      keyword,
      font: fontStyle === italicFontStyle ? italicFontFamily : supportFonts[fontRandomIndex]
    }
  })
  return applyKeywords
}

const calculateOffsetX = (radius, width) => {
  return radius - width / 2 + keywordPadding / 2
}

const settingMap = {
  fontStyle: {
    allow: ['normal', 'italic'],
    default: 'normal'
  },
  fontFamily: {
    allow: supportFonts,
    default: ''
  },
  theme: {
    allow: ['light', 'dark'],
    default: 'light'
  }
}

const pickUserSetting = (userSetting, settingKey) => {
  return settingMap[settingKey].allow.includes(userSetting) ? userSetting : settingMap[settingKey].default
}
exports.supportFonts = supportFonts
exports.otfFontFamily = otfFontFamily
exports.getUserConfig = getUserConfig
exports.happyLog = happyLog
exports.errorLog = errorLog
exports.sleep = sleep
exports.generateOra = generateOra
exports.pickKeywords = pickKeywords
exports.random = random
exports.randomColor = randomColor
exports.checkHex = checkHex
exports.pickHex = pickHex
exports.checkBol = checkBol
exports.calculateKeywords = calculateKeywords
exports.calculateOffsetX = calculateOffsetX
exports.getMarkDownName = getMarkDownName
exports.pickUserSetting = pickUserSetting
exports.italicFontWeight = italicFontWeight
exports.italicFontStyle = italicFontStyle
exports.italicFontFamily = italicFontFamily
