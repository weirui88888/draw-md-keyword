const path = require('path')
const base64Img = require('base64-img')
const { createCanvas, registerFont } = require('canvas')
const chalk = require('chalk')
const {
  calculateKeywords,
  calculateOffsetX,
  getMarkDownName,
  pickUserSetting,
  pickKeywords,
  randomColor,
  pickHex,
  checkBol,
  calculateMainAuthorPoint,
  generateOra,
  sleep
} = require('./util')

const { defaultFolderName, defaultFormat, canvasSetting } = require('./const')

class Circle {
  constructor(x, y, r, keywordInfo) {
    this.x = x
    this.y = y
    this.r = r
    this.color = this.getRandomColor()
    this.keywordInfo = keywordInfo
  }
  getRandomColor() {
    return randomColor()
  }
}

class Generator {
  constructor(filePath, userDir, userConfig) {
    const { folderName, max, format, singleKeywordMaxLength, authorOption, canvasConfig } = userConfig
    this.setFontFamily()
    this.generatorOra = generateOra({
      spinner: 'soccerHeader'
    })
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
    // 支持暗黑圆角 radius
    this.themeDarkRadius = true
    this.fontStyle = pickUserSetting(canvasConfig.fontStyle, canvasSetting.fontStyle)
    this.fontFamily = pickUserSetting(canvasConfig.fontFamily, canvasSetting.fontFamily)
    this.showAuthor = checkBol(authorOption?.author)
    this.mainAuthorPoints = calculateMainAuthorPoint(
      this.authorPointX,
      this.authorPointY,
      canvasSetting.authorWidth,
      canvasSetting.authorHeight
    )
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

  async draw() {
    this.generatorOra.start(
      `\n马不停蹄的${chalk.green(
        '计算有效绘制'
      )}中，请稍等...\n如果足球长时间停止不动了(6秒左右)\n那么大概率本次绘制任务${chalk.red(
        '失败'
      )}了，\n请关闭终端后在配置文件中适当${chalk.green('调整画布大小')}，\n或者设置合理的${chalk.green(
        '最大关键字生成数量'
      )}，\n当然也可以将绘制${chalk.green('字体大小')}适当的减小后再次执行 ${chalk.green('[dwk draw <md filePath>]')}`
    )
    await sleep(2)
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
        // ctx.beginPath()
        // ctx.strokeRect(this.authorPointX, this.authorPointY, canvasSetting.authorWidth, canvasSetting.authorHeight)
      } catch (error) {
        throw error
      }
    }
  }

  // 绘制圆角矩形
  setDarkRadiusRect(x, y, width, height, r, lineWidth, color) {
    const ctx = this.ctx
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    // 1
    ctx.moveTo(x + r, y + lineWidth)
    ctx.lineTo(x + width - r, y + lineWidth)
    // 2
    ctx.moveTo(x + r, y + height - lineWidth)
    ctx.lineTo(x + width - r, y + height - lineWidth)
    // 3
    ctx.moveTo(x + lineWidth, y + r)
    ctx.lineTo(x + lineWidth, y + height - r)
    // 4
    ctx.moveTo(x + width - lineWidth, y + r)
    ctx.lineTo(x + width - lineWidth, y + height - r)
    // 5
    ctx.moveTo(x + r, y + lineWidth)
    ctx.arcTo(x + lineWidth, y + lineWidth, x + lineWidth, y + r, r - lineWidth)
    // 6
    ctx.moveTo(x + width - r, y + lineWidth)
    ctx.arcTo(x + width - lineWidth, y + lineWidth, x + width - lineWidth, y + r, r - lineWidth)
    // 7
    ctx.moveTo(x + lineWidth, y + height - r)
    ctx.arcTo(x + lineWidth, y + height - lineWidth, x + r, y + height - lineWidth, r - lineWidth)
    // 8
    ctx.moveTo(x + width - r, y + height - lineWidth)
    ctx.arcTo(x + width - lineWidth, y + height - lineWidth, x + width - lineWidth, y + height - r, r - lineWidth)
    ctx.strokeStyle = color || '#ffffff'
    ctx.stroke()
    ctx.restore()
  }

  setTheme() {
    const ctx = this.ctx
    if (this.theme === canvasSetting.themeDark) {
      ctx.save()
      ctx.fillStyle = canvasSetting.black
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      ctx.restore()
      // if (this.themeDarkRadius) {
      //   this.setDarkRadiusRect(0, 0, this.canvasWidth, this.canvasHeight, 50, 20, '#ffffff')
      // }
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
  // TODO:待优化的地方，如何判断一个圆，不与右下角绘制作者的区域重叠,现在是采关键点进行判断
  checkCollide(x, y, r) {
    let collide = false
    for (let i = 0; i < this.mainAuthorPoints.length; i++) {
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, 2 * Math.PI)
      const authorMainPointInPath = this.ctx.isPointInPath(this.mainAuthorPoints[i][0], this.mainAuthorPoints[i][1])
      if (authorMainPointInPath) {
        collide = true
        break
      }
    }

    return collide
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
      ctx.font = this.setFont(this.fontSize, circle.keywordInfo.font)
      ctx.fillText(
        circle.keywordInfo.keyword,
        circle.x - circle.r + calculateOffsetX(circle.r, circle.keywordInfo.width),
        circle.y - this.fontSize / 2
      )
      this.circleDrawedCount++
      if (this.circleDrawedCount - 1 === this.applyKeywords.length) {
        this.generatePng()
      }
    } catch (error) {
      this.generatorOra.fail(error.message)
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
    base64Img.img(base64img, drawImgPath, `${this.markDownName}`, (error, filepath) => {
      if (error) {
        this.generatorOra.fail(error.message)
      } else {
        this.generatorOra.succeed(
          `生成关键字图片${chalk.green('成功')}\n路径为：\n${chalk.green(filepath)}\n快去试试 ${chalk.green(
            'draw oss <upload filepath>'
          )} 或者 ${chalk.green('draw github <upload filepath>')} 来上传图片吧`
        )
      }
    })
  }
}

module.exports = Generator
