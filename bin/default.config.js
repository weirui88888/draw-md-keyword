module.exports = {
  configFileName: 'dmk.config.js',
  initConfig: () => {
    return `const dkConfig = {
      canvasConfig: {
        width: 800, // 图片宽度
        height: 600, // 图片高度
        fontSize: 30, // 字体的默认大小，字体越大，会使生成的云图中的关键字越少,
        theme: 'light', // light透明背景，dark黑色背景
        align: 'default', // 文字排列模式，default默认模式，tilt为随意倾斜模式
      },
      folderName:'dmk', // 生成图片的文件夹
      format: 'yyyy-mm-dd', // 生成图片的名称的前缀，不建议以/作为分隔符，因为生成时会将/当作特殊文件夹分隔符
      max:10, // 最多生成包括多少个关键字的云图，超出设置的值时会随机选中10个
      singleKeywordMaxLength:10, // 单个关键词的最大长度
      author: '', // 设置作者字段后，在生成的云图的右下角进行签名
    }
    module.exports = dkConfig;
    `
  }
}
