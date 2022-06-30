const path = require('path')
const base64Img = require('base64-img')
const { createCanvas, registerFont } = require('canvas')
const { calculateKeywords, calculateOffsetX, errorLog, happyLog, getMarkDownName } = require('./util')

const paintFontPath = path.join(process.execPath, '../../lib/node_modules/draw-md-keyword/font/paint.ttf')
const hollowFontPath = path.join(process.execPath, '../../lib/node_modules/draw-md-keyword/font/hollow.ttf')
const brushFontPath = path.join(process.execPath, '../../lib/node_modules/draw-md-keyword/font/brush.ttf')
const cartoonFontPath = path.join(process.execPath, '../../lib/node_modules/draw-md-keyword/font/cartoon.ttf')
registerFont(paintFontPath, {
  family: 'paint'
})
registerFont(hollowFontPath, {
  family: 'hollow'
})
registerFont(cartoonFontPath, {
  family: 'cartoon'
})
registerFont(brushFontPath, {
  family: 'brush'
})

class Circle {
  constructor(x, y, r, keywordInfo) {
    this.x = x
    this.y = y
    this.r = r
    this.color = this.getRandomColor()
    this.k = keywordInfo
  }
  getRandomColor() {
    let r = Math.floor(Math.random() * 100) + 155
    let g = Math.floor(Math.random() * 100) + 155
    let b = Math.floor(Math.random() * 100) + 155
    return `rgb(${r},${g},${b})`
  }
}

class Generator {
  constructor(filePath, keywords, userConfig) {
    const { folderName, max, format, singleKeywordMaxLength, author, canvasConfig } = userConfig
    this.keywords = keywords
    this.userConfig = this.userConfig
    this.folderName = folderName || 'dmk'
    this.max = max || 10
    this.singleKeywordMaxLength = singleKeywordMaxLength || 10
    this.author = author || ''
    this.fontSize = canvasConfig.fontSize || 40
    this.format = format || 'yyyy-mm-dd'
    this.markDownName = getMarkDownName(filePath, this.format)
    this.canvas = createCanvas(canvasConfig.width, canvasConfig.height)
    this.ctx = this.canvas.getContext('2d')
    this.canvasWidth = canvasConfig.width
    this.canvasHeight = canvasConfig.height
    this.authorPointX = canvasConfig.width - 100
    this.authorPointY = canvasConfig.height - 100
    this.theme = canvasConfig.theme || 'light'
    this.backgroundColor = canvasConfig.backgroundColor || false
    this.fontColor = canvasConfig.fontColor || false

    this.showAuthor = !!author
    this.applyKeywords = calculateKeywords(
      this.fontSize,
      this.keywords,
      this.max,
      this.singleKeywordMaxLength,
      this.ctx
    )
    this.circleStore = []
    this.circleDrawedCount = 1
  }

  draw() {
    let n = 0
    while (this.circleStore.length < this.applyKeywords.length) {
      this.circleStore = []
      let i = 0
      while (this.circleStore.length < this.applyKeywords.length) {
        this.createOneCircle()
        i++
        if (i >= 1000) {
          break
        }
      }
      n++
      if (n > 1000) {
        break
      }
    }

    this.setTheme()

    this.circleStore
      .sort((a, b) => b.r - a.r)
      .forEach(circle => {
        this.drawOneCircle(circle)
      })
  }

  setTheme() {
    const ctx = this.ctx
    if (this.theme === 'dark') {
      ctx.save()
      // this.ctx.strokeStyle = '#000000'
      // this.ctx.rect(0, 0, this.canvasWidth, this.canvasHeight)
      // this.ctx.stroke()
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      ctx.restore()
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
      if (this.check(randomX, randomY, randomR) || attempts > 200) {
        break
      }
    }
    this.check(randomX, randomY, randomR) &&
      this.circleStore.push(new Circle(randomX, randomY, randomR, drawedKeywordInfo))
  }

  // 获取一个新圆的半径，主要判断半径与最近的一个圆的距离
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
    const abs = Math.sqrt(
      (x - this.authorPointX) * (x - this.authorPointX) + (y - this.authorPointY) * (y - this.authorPointY)
    )
    return abs < r + 50
  }

  drawOneCircle(circle) {
    try {
      let ctx = this.ctx
      let fillTextStyle
      ctx.save()
      if (this.theme === 'light') {
        ctx.beginPath()
        ctx.fillStyle = circle.color
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
      }
      if (this.theme === 'light') {
        fillTextStyle = '#000000'
      } else if (this.theme === 'dark') {
        fillTextStyle = circle.color
      }
      ctx.fillStyle = fillTextStyle
      ctx.textBaseline = 'top'
      ctx.font = `${this.fontSize}px ${circle.k.font}`
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
