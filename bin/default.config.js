module.exports = {
  configFileName: 'dmk.config.js',
  initConfig: () => {
    return `const dkConfig = {
  canvasConfig: {
    width: 800, // 图片宽度
    height: 600, // 图片高度
    fontSize: 30, // 字体的默认大小，字体越大，会使生成的云图中的关键字越少,
    theme: 'light', // light透明背景，dark黑色背景
    themeLightFontColor: '#000000', // theme为light情况下，绘制关键字的颜色，如果不是一个hex格式的颜色，会进行随机颜色绘制
    themeLightBorder: false, // theme为light情况下，绘制的图片是否需要边框，默认不需要
    fontStyle: 'normal', // normal正常字体，italic斜体（斜体会使用Microsoft YaHei）
    fontFamily: 'paint' // 支持六种字体:brush毛笔体，cartoon卡通体，hollow镂空体，paint画刷体，kai楷体，newYork专供英文字体，如果设置后会选中设置的字体，否则会随机进行匹配
  },
  folderName: 'dmk', // 生成图片的文件夹
  format: 'yyyy-mm-dd', // 生成图片的名称的前缀，不建议以/作为分隔符，因为生成时会将/当作特殊文件夹分隔符，支持yy、mm、dd、yyyy随机排列
  max: 10, // 最多生成包括多少个关键字的云图，超出设置的值时会随机选中10个
  singleKeywordMaxLength: 10, // 单个关键词的最大长度
  // 设置作者字段后，在生成的云图的右下角进行签名
  authorOption: {
    author: '程序猿', // 作者名
    font: {
      family: 'cursive', // 字体，支持上面的几种，选择的字体可能不能完全适应你的作者名，请选择合适的
      color: '#000000', // 字体颜色，如果在暗黑模式下，请设置正确的颜色，否则看不见～
      size: 30 // 字体大小，注：作者绘制区域在canvas画布的右下角100*100大小，过多的字体或者过大的字体导致看不见～
    }
  },
  oss: {
    autoUpload: false, // 开启并设置正确配置后，可在生成图片后上传阿里云，并且上传后复制到剪贴板
    accessKey: 'xxx',
    accessSecret: 'xxx',
    bucket: 'xxx'
  }
}
module.exports = dkConfig
`
  }
}
