const path = require('path')
const base64Img = require('base64-img')
const { createCanvas, registerFont } = require('canvas')
const {
  calculateKeywords,
  calculateOffsetX,
  errorLog,
  happyLog,
  getMarkDownName,
  pickUserSetting,
  pickKeywords,
  randomColor,
  pickHex,
  checkBol
} = require('./util')

const { defaultFolderName, defaultFormat, canvasSetting } = require('./const')

class Circle {
  constructor(x, y, r, keywordInfo) {
    this.x = x
    this.y = y
    this.r = r
    this.color = this.getRandomColor()
    this.k = keywordInfo
  }
  getRandomColor() {
    return randomColor()
  }
}

class Generator {
  constructor(filePath, userDir, userConfig) {
    const { folderName, max, format, singleKeywordMaxLength, authorOption, canvasConfig } = userConfig
    this.setFontFamily()
    this.keywords = pickKeywords(path.resolve(userDir, filePath))
    this.userConfig = this.userConfig
    this.folderName = folderName || defaultFolderName
    this.max = pickUserSetting(max, canvasSetting.max)
    this.singleKeywordMaxLength = pickUserSetting(singleKeywordMaxLength, canvasSetting.singleKeywordMaxLength)
    this.fontSize = pickUserSetting(canvasConfig.fontSize, canvasSetting.fontSize)
    this.format = format || defaultFormat
    this.markDownName = getMarkDownName(filePath, this.format)
    this.canvasWidth = pickUserSetting(canvasConfig.width, canvasSetting.width)
    this.canvasHeight = pickUserSetting(canvasConfig.height, canvasSetting.height)
    this.authorPointX = this.canvasWidth - canvasSetting.authorWidth
    this.authorPointY = this.canvasHeight - canvasSetting.authorHeight
    this.canvas = createCanvas(this.canvasWidth, this.canvasHeight)
    this.ctx = this.canvas.getContext('2d')
    this.theme = pickUserSetting(canvasConfig.theme, canvasSetting.theme)
    this.themeLightFontColor = canvasConfig.themeLightFontColor
    this.themeLightBorder = checkBol(canvasConfig.themeLightBorder)
    this.fontStyle = pickUserSetting(canvasConfig.fontStyle, canvasSetting.fontStyle)
    this.fontFamily = pickUserSetting(canvasConfig.fontFamily, canvasSetting.fontFamily)
    this.showAuthor = checkBol(authorOption?.author)
    this.authorOption = authorOption
    this.applyKeywords = calculateKeywords({
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontStyle: this.fontStyle,
      keywords: this.keywords,
      max: this.max,
      singleKeywordMaxLength: this.singleKeywordMaxLength,
      ctx: this.ctx
    })
    this.circleStore = []
    this.circleDrawedCount = 1
  }

  setFontFamily() {
    canvasSetting.supportFonts.forEach(font => {
      const applyFont = canvasSetting.otfFontFamily.includes(font) ? `${font}.otf` : `${font}.ttf`
      const fontPath = path.join(process.execPath, `../../lib/node_modules/draw-md-keyword/font/${applyFont}`)
      registerFont(fontPath, {
        family: font
      })
    })
  }

  draw() {
    let n = 0
    while (this.circleStore.length < this.applyKeywords.length) {
      this.circleStore = []
      let i = 0
      while (this.circleStore.length < this.applyKeywords.length) {
        this.createOneCircle()
        i++
        if (i >= canvasSetting.attemptDrawCount) {
          break
        }
      }
      n++
      if (n > canvasSetting.attemptDrawCount) {
        break
      }
    }

    this.setTheme()
    this.drawAuthor()

    this.circleStore
      .sort((a, b) => b.r - a.r)
      .forEach(circle => {
        this.drawOneCircle(circle)
      })
  }

  drawAuthor() {
    if (this.showAuthor) {
      try {
        const { author, font = {} } = this.authorOption
        const { color, family, size } = font
        const ctx = this.ctx
        ctx.beginPath()
        ctx.textBaseline = canvasSetting.textBaseline
        ctx.fillStyle = `${color}`
        ctx.font = `${size}px ${family}`
        ctx.fillText(author, this.authorPointX, this.authorPointY + canvasSetting.authorOffsetY)
      } catch (error) {
        throw error
      }
    }
  }

  setTheme() {
    const ctx = this.ctx
    if (this.theme === canvasSetting.themeDark) {
      ctx.save()
      ctx.fillStyle = canvasSetting.black
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      ctx.restore()
    } else {
      if (this.themeLightBorder) {
        ctx.save()
        ctx.strokeStyle = canvasSetting.black
        ctx.rect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  createOneCircle() {
    let randomX, randomY, randomR, drawedKeywordInfo
    let attempts = 0
    while (true) {
      attempts++
      randomX = Math.floor(Math.random() * this.canvasWidth)
      randomY = Math.floor(Math.random() * this.canvasHeight)
      let { circleRadius, keywordInfo } = this.getCircleRadius(randomX, randomY)
      if (!circleRadius) {
        continue
      } else {
        randomR = circleRadius
        drawedKeywordInfo = keywordInfo
      }
      if (this.check(randomX, randomY, randomR) || attempts > canvasSetting.attemptCreateCircle) {
        break
      }
    }
    this.check(randomX, randomY, randomR) && this.circleStore.push(new Circle(randomX, randomY, randomR, drawedKeywordInfo))
  }

  getCircleRadius(randomX, randomY) {
    if (this.circleStore.length === 0)
      return {
        circleRadius: this.applyKeywords[0].circleRadius,
        keywordInfo: this.applyKeywords[0]
      }
    let distances = this.circleStore.map(circle => {
      let xSpan = circle.x - randomX
      let ySpan = circle.y - randomY
      return Math.floor(Math.sqrt(Math.pow(xSpan, 2) + Math.pow(ySpan, 2))) - circle.r
    })
    let minDistance = Math.min(...distances)
    let minDistanceCircle = this.circleStore[distances.indexOf(minDistance)]
    let applyRadius = this.applyKeywords[this.circleStore.length].circleRadius
    let validRadius = applyRadius <= minDistance - minDistanceCircle.r
    return validRadius
      ? {
          circleRadius: applyRadius,
          keywordInfo: this.applyKeywords[this.circleStore.length]
        }
      : false
  }

  check(x, y, r) {
    if (this.showAuthor && this.checkCollide(x, y, r)) return false
    return !(x + r > this.canvasWidth || x - r < 0 || y + r > this.canvasHeight || y - r < 0)
  }

  checkCollide(x, y, r) {
    const abs = Math.sqrt((x - this.authorPointX) * (x - this.authorPointX) + (y - this.authorPointY) * (y - this.authorPointY))
    return abs < r + canvasSetting.authorOffsetY
  }

  drawOneCircle(circle) {
    let ctx = this.ctx
    try {
      let fillTextStyle = pickHex(this.themeLightFontColor)
      if (this.theme === canvasSetting.themeLight) {
        ctx.beginPath()
        ctx.fillStyle = circle.color
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
      }
      if (this.theme === canvasSetting.themeDark) {
        fillTextStyle = circle.color
      }
      ctx.fillStyle = fillTextStyle
      ctx.textBaseline = canvasSetting.textBaseline
      ctx.font = this.setFont(this.fontSize, circle.k.font)
      ctx.fillText(
        circle.k.keyword,
        circle.x - circle.r + calculateOffsetX(circle.r, circle.k.width),
        circle.y - this.fontSize / 2
      )
      this.circleDrawedCount++
      if (this.circleDrawedCount - 1 === this.applyKeywords.length) {
        this.generatePng()
      }
    } catch (error) {
      errorLog(error.message)
    }
  }

  setFont(size, font) {
    if (this.fontStyle === canvasSetting.italicFontStyle) {
      return `${canvasSetting.italicFontStyle} ${canvasSetting.fontWeight} ${size}px ${canvasSetting.italicFontFamily}`
    } else {
      return !!this.fontFamily
        ? `normal ${canvasSetting.fontWeight} ${size}px ${this.fontFamily}`
        : `normal ${canvasSetting.fontWeight} ${size}px ${font}`
    }
  }

  generatePng() {
    const base64img = this.canvas.toDataURL()
    const drawImgPath = path.join(path.resolve(), `./${this.folderName}/`)
    base64Img.img(base64img, drawImgPath, `${this.markDownName}`, function (error, filepath) {
      if (error) {
        errorLog(error.message)
      } else {
        happyLog(filepath)
      }
    })
  }
}

module.exports = Generator
