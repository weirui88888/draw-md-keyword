// 常量定义

// 默认生成文件夹的名称
const defaultFolderName = 'dmk'
// 默认文件名格式
const defaultFormat = 'yyyy-mm-dd'
// 字体默认添加的左右padding
const keywordPadding = 10

const codeType = 'code'
const strongType = 'strong'
// 支持被绘画的md类型
const supportDrawType = [codeType, strongType]

// canvas相关配置
const canvasSetting = {
  max: 'max',
  singleKeywordMaxLength: 'singleKeywordMaxLength',
  fontSize: 'fontSize',
  fontStyle: 'fontStyle',
  fontFamily: 'fontFamily',
  fontWeight: 900,
  width: 'width',
  height: 'height',
  theme: 'theme',
  singleKeywordMaxLength: 'singleKeywordMaxLength',
  attemptDrawCount: 1000,
  attemptCreateCircle: 200,
  textBaseline: 'top',
  // 以下跟author相关的不要轻易改，否则会需要重新计算很多东西
  authorWidth: 100,
  authorHeight: 100,
  authorOffsetY: 50,
  authorRadius: 50,
  themeDark: 'dark',
  themeLight: 'light',
  black: '#000000',
  italicFontStyle: 'italic',
  italicFontFamily: 'Microsoft YaHei',
  supportFonts: ['zh', 'en'],
  otfFontFamily: [],
  supportFontStyle: ['normal', 'italic'],
  defaultFontStyle: 'normal',
  supportTheme: ['light', 'dark'],
  defaultTheme: 'light',
  defaultMax: 10,
  defaultSingleKeywordMaxLength: 10,
  defaultFontSize: 40,
  defaultCanvasWidth: 800,
  defaultCanvasHeight: 400
}

module.exports = {
  defaultFolderName,
  defaultFormat,
  keywordPadding,
  canvasSetting,
  supportDrawType,
  codeType,
  strongType
}
