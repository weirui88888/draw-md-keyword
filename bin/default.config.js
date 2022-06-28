module.exports = {
  configFileName: "dk.config.js",
  initConfig: () => {
    return `const dkConfig = {
      canvasConfig: {
        width: 800, // 图片宽度
        height: 600 // 图片高度
      },
      folderName:'dkeyword', // 生成图片的文件夹
      max:10, // 最多生成包括多少个关键字的云图，超出设置的值时会随机选中10个
      singleKeywordMaxLength:10, // 单个关键词的最大长度
      author: '' // 设置作者字段后，在生成的云图的右下角进行签名
    }
    module.exports = dkConfig;
    `
  }
}
