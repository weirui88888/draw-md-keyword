const path = require("path")
const base64Img = require("base64-img")
const { createCanvas, registerFont } = require("canvas")
const { calculateKeywords } = require("./util")

const fontPath = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/Muyao-Softbrush.ttf")
const fontPathStroke = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/stroke.ttf")
const fontPathMaobi = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/maobi.ttf")
const fontPathKatong = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/katong.ttf")
registerFont(fontPath, {
  family: "muyao"
})
registerFont(fontPathStroke, {
  family: "stroke"
})
registerFont(fontPathKatong, {
  family: "katong"
})
registerFont(fontPathMaobi, {
  family: "maobi"
})

class Generator {
  constructor(keywords, userConfig) {
    const { folderName, max, singleKeywordMaxLength, author, canvasConfig } = userConfig
    this.keywords = keywords
    this.userConfig = this.userConfig
    // user config
    this.folderName = folderName || "dkeyword"
    this.max = max || 10
    this.singleKeywordMaxLength = singleKeywordMaxLength || 10
    this.author = author || ""

    // canvas config
    this.canvas = createCanvas(canvasConfig.width, canvasConfig.height)
    this.ctx = this.canvas.getContext("2d")
    this.canvasWidth = canvasConfig.width
    this.canvasHeight = canvasConfig.height
    this.authorPointX = canvasConfig.width - 100
    this.authorPointY = canvasConfig.height - 100
    this.showAuthor = !!author
    this.applyKeywords = calculateKeywords(this.keywords, this.max, this.singleKeywordMaxLength, this.ctx)
  }

  draw() {
    const word = "hello world"
    this.ctx.font = "30px muyao"
    this.ctx.fillText(word, 100, 100)
    this.ctx.font = "30px stroke"
    this.ctx.fillText(word, 100, 200)
    this.ctx.font = "30px katong"
    this.ctx.fillText(word, 100, 300)
    this.ctx.font = "30px maobi"
    this.ctx.fillText(word, 100, 400)
    this.generatePng()
  }

  generatePng() {
    const base64img = this.canvas.toDataURL()
    const drawImgPath = path.join(path.resolve(), `./${this.folderName}/`)
    base64Img.img(base64img, drawImgPath, `${Date.now()}`, function (err, filepath) {
      if (err) {
        console.log(err)
      } else {
        console.log(filepath)
      }
    })
  }
}

module.exports = Generator
