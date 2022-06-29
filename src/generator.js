const path = require('path')
const base64Img = require('base64-img')
const { createCanvas, registerFont } = require('canvas')
const { calculateKeywords } = require('./util')

const fontPath = path.join(
  process.execPath,
  '../../lib/node_modules/draw-md-keyword/font/Muyao-Softbrush.ttf'
)
const fontPathStroke = path.join(
  process.execPath,
  '../../lib/node_modules/draw-md-keyword/font/stroke.ttf'
)
const fontPathMaobi = path.join(
  process.execPath,
  '../../lib/node_modules/draw-md-keyword/font/maobi.ttf'
)
const fontPathKatong = path.join(
  process.execPath,
  '../../lib/node_modules/draw-md-keyword/font/katong.ttf'
)
registerFont(fontPath, {
  family: 'muyao'
})
registerFont(fontPathStroke, {
  family: 'stroke'
})
registerFont(fontPathKatong, {
  family: 'katong'
})
registerFont(fontPathMaobi, {
  family: 'maobi'
})

class Circle {
  constructor(x, y, r, keyword) {
    this.x = x
    this.y = y
    this.r = r
    this.c = this.getRandomColor()
    this.keyword = keyword
  }
  getRandomColor() {
    let r = Math.floor(Math.random() * 100) + 155
    let g = Math.floor(Math.random() * 100) + 155
    let b = Math.floor(Math.random() * 100) + 155
    return `rgb(${r},${g},${b})`
  }
}

class Generator {
  constructor(keywords, userConfig) {
    const { folderName, max, singleKeywordMaxLength, author, canvasConfig } =
      userConfig
    this.keywords = keywords
    this.userConfig = this.userConfig
    // user config
    this.folderName = folderName || 'dmk'
    this.max = max || 10
    this.singleKeywordMaxLength = singleKeywordMaxLength || 10
    this.author = author || ''

    // canvas config
    this.canvas = createCanvas(canvasConfig.width, canvasConfig.height)
    this.ctx = this.canvas.getContext('2d')
    this.canvasWidth = canvasConfig.width
    this.canvasHeight = canvasConfig.height
    this.authorPointX = canvasConfig.width - 100
    this.authorPointY = canvasConfig.height - 100
    this.showAuthor = !!author
    this.applyKeywords = calculateKeywords(
      this.keywords,
      this.max,
      this.singleKeywordMaxLength,
      this.ctx
    )
    this.circleArray = []
    this.circleNumber = 1
  }

  draw() {
    let n = 0
    while (this.circleArray.length < this.applyKeywords.length) {
      this.circleArray = []
      let i = 0
      while (this.circleArray.length < this.applyKeywords.length) {
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
    // 根据半径从大到小画圆。
    this.circleArray
      .sort((a, b) => b.r - a.r)
      .forEach(c => {
        this.drawOneCircle(c)
      })
  }

  createOneCircle() {
    let x, y, r, keyword
    let createCircleTimes = 0
    while (true) {
      createCircleTimes++
      x = Math.floor(Math.random() * this.canvasWidth)
      y = Math.floor(Math.random() * this.canvasHeight)
      let { TR, info } = this.getR(x, y)
      if (!TR) {
        continue
      } else {
        r = TR
        keyword = info
      }
      if (this.check(x, y, r) || createCircleTimes > 200) {
        break
      }
    }
    this.check(x, y, r) && this.circleArray.push(new Circle(x, y, r, keyword))
  }

  // 获取一个新圆的半径，主要判断半径与最近的一个圆的距离
  getR(x, y) {
    if (this.circleArray.length === 0)
      return {
        TR: this.applyKeywords[0].arcR,
        info: this.applyKeywords[0]
      }
    let lenArr = this.circleArray.map(c => {
      let xSpan = c.x - x
      let ySpan = c.y - y
      return (
        Math.floor(Math.sqrt(Math.pow(xSpan, 2) + Math.pow(ySpan, 2))) - c.r
      )
    })
    let minCircleLen = Math.min(...lenArr)
    let minC = this.circleArray[lenArr.indexOf(minCircleLen)]
    let tempR = this.applyKeywords[this.circleArray.length].arcR
    let bool = tempR <= minCircleLen - minC.r
    return bool
      ? {
          TR: tempR,
          info: this.applyKeywords[this.circleArray.length]
        }
      : false
  }

  check(x, y, r) {
    if (this.showAuthor && this.checkCollide(x, y, r)) return false
    return !(
      x + r > this.canvasWidth ||
      x - r < 0 ||
      y + r > this.canvasHeight ||
      y - r < 0
    )
  }

  checkCollide(x, y, r) {
    const abs = Math.sqrt(
      (x - this.authorPointX) * (x - this.authorPointX) +
        (y - this.authorPointY) * (y - this.authorPointY)
    )
    return abs < r + 50
  }

  drawOneCircle(c) {
    let ctx = this.ctx
    ctx.beginPath()
    // ctx.strokeStyle = c.c
    // ctx.fillStyle = c.c
    // ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI)
    // ctx.stroke()
    // ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.font = `40px ${c.keyword.font}`
    ctx.fillText(c.keyword.keyword, c.x - c.r + 5, c.y + 5)
    // ctx.fillText("R:" + c.r, c.x - 10, c.y + 25)

    this.circleNumber++
    if (this.circleNumber - 1 === this.applyKeywords.length) {
      this.generatePng()
    }
  }

  generatePng() {
    const base64img = this.canvas.toDataURL()
    const drawImgPath = path.join(path.resolve(), `./${this.folderName}/`)
    base64Img.img(
      base64img,
      drawImgPath,
      `${Date.now()}`,
      function (err, filepath) {
        if (err) {
          console.log(err)
        } else {
          console.log(filepath)
        }
      }
    )
  }
}

module.exports = Generator
