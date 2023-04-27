module.exports = {
  configFileName: 'dmk.config.js',
  initConfig: () => {
    return `const dkConfig = {
  canvasConfig: {
    width: 800, // 图片宽度
    height: 400, // 图片高度
    fontSize: 20, // 字体的默认大小，字体越大，会使生成的云图中的关键字越少,
    theme: 'light', // light透明背景，dark黑色背景
    themeLightFontColor: '#000000', // theme为light情况下，绘制关键字的颜色，如果不是一个hex格式的颜色，会进行随机颜色绘制
    themeLightBorder: true, // theme为light情况下，绘制的图片是否需要边框，默认不需要
    fontStyle: 'normal', // normal正常字体，italic斜体（斜体会使用Microsoft YaHei）
    fontFamily: 'en', // 目前支持中英文两种字体，zh为中文手绘体，en为圆润英文字体，如果设置后会选中设置的字体，否则会随机进行匹配(为了缩小体积包，已经去除中文字体包，只支持en)
    windowControl: true, // 是否需要仿mac终端左上角三个按钮
  },
  copyAble: true,
  folderName: 'dmk', // 图片生成后放入哪个文件夹
  format: 'yyyy-mm-dd', // 生成图片的名称的前缀，不建议以/作为分隔符，因为生成时会将/当作特殊文件夹分隔符，支持yy、mm、dd、yyyy随机排列
  max: 20, // 最多生成包括多少个关键字的云图，超出设置的值时会随机选中10个
  singleKeywordMaxLength: 10, // 单个关键词的最大长度
  // 设置作者字段后，在生成的云图的右下角进行签名
  authorOption: {
    author: 'weirui88888', // 作者名
    font: {
      family: 'en', // 同上，当前支持zh和en(为了缩小体积包，已经去除中文字体包，只支持en)
      color: '#000000', // 字体颜色，如果在暗黑模式下，请设置正确的颜色，否则看不见～
      size: 18 // 字体大小，注：作者绘制区域在canvas画布的右下角100*100大小，过多的字体或者过大的字体导致看不见～
    }
  },
  // 支持一键上传oss，相关配置请参考 https://www.npmjs.com/package/ali-oss，region、accessKeyId、accessKeySecret、bucket是必须要正确填写
  oss: { 
    region: '',
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    folderName: '', // 上传图片至哪个文件夹
    host: '' // 自定义域名
  },
  // 支持一键上传github，可以利用gh-pages实现个人关键字图集库，方便后期使用
  github: {
    personalAccessToken: '',
    owner: '', // github用户名
    repo: '', // github仓库名，任意仓库都可以上传，但建议利用gh-pages当作自己的服务器，可方便存储预览
    branch: '', // 分支名，如果利用gh-pages功能的话，这里使用gh-pages
    imgPath: '', // 图片路径，任意合理的路径都可以，比如images，图片会被上传到images/xxx.png，比如images/dmk，图片会被上传到images/dmk/xxx.png
    customDomain: '' // 自定义域名，生效的前提是你上传的仓库名是形如owner.github.io，这里的owner就是你上面添加的github用户名，并且上面配置的branch为gh-pages，还有就是你配置了自己的域名，不展开陈述了，不会设置的去参考上上网相关的资料
  }
}
module.exports = dkConfig
`
  }
}
