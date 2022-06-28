const path = require("path")
const base64Img = require("base64-img")
const { createCanvas, registerFont } = require("canvas")

const fontPath = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/Muyao-Softbrush.ttf")
registerFont(fontPath, {
  family: "muyao"
})

class Generator {
  constructor(keywords, userConfig) {
    this.keywords = keywords
    this.userConfig = userConfig
    console.log(this.userConfig)
  }

  draw() {
    const canvas = createCanvas(600, 400)
    const ctx = canvas.getContext("2d")
    ctx.font = "30px muyao"
    ctx.fillText("快乐生活的每一天", 50, 100)
    const base64img = canvas.toDataURL()
    const drawImgPath = path.join(path.resolve(), `./dkeyword/`)
    this.generatePng(base64img, drawImgPath)
  }

  generatePng(base64img, path) {
    base64Img.img(base64img, path, `${Date.now()}`, function (err, filepath) {
      if (err) {
        console.log(err)
      } else {
        console.log(filepath)
      }
    })
  }
}

module.exports = Generator
