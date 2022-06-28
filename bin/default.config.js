module.exports = {
  configFileName: "dk.config.js",
  initConfig: () => {
    return `const dkConfig = {
      keywords: [], // 被绘制的关键字列表
      canvasConfig: {
        width: 800, // 图片宽度
        height: 600 // 图片高度
      }
    }
    module.exports = dkConfig;
    `
  }
}
