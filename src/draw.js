const path = require("path")
const base64Img = require("base64-img")
// 这里应该有更好的办法获取当前包中的font
const fontPath = path.join(process.execPath, "../../lib/node_modules/dkeyword/font/Muyao-Softbrush.ttf")
const { createCanvas, registerFont } = require("canvas")
registerFont(fontPath, {
  family: "muyao"
})

const draw = (keywords, config) => {
  console.log(keywords)
  console.log(config)

  const canvas = createCanvas(600, 400)
  const ctx = canvas.getContext("2d")
  ctx.font = "30px muyao"
  ctx.fillText("快乐生活的每一天", 50, 100)
  const base64img = canvas.toDataURL()
  // console.log(base64img)
  const drawImgPath = path.join(path.resolve(), `./dkeyword/`)
  generatePng(base64img, drawImgPath)
}

const generatePng = (base64img, path) => {
  base64Img.img(base64img, path, `${Date.now1()}`, function (err, filepath) {
    if (err) {
      console.log(err)
    } else {
      console.log(filepath)
    }
  })
}

exports.draw = draw
