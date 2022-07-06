<h2 align="center">一款可以一键生成关键词云图的小工具</h2>
<p align="center"><img src="https://img.shields.io/badge/npm-%40v1.0.0-yellow"/> <img src="https://img.shields.io/badge/node-command-brightgreen"/> <img src="https://img.shields.io/badge/canvas-draw-orange"/></p>

下面这张包含本篇 README.md 关键词云图和作者签名的图片，就是使用该工具库一键生成后上传到阿里云上，来作为该 README.md 的封面图的。

<p align="center"><img src="https://show.newarray.vip/blog/dmk-show.png"/></p>

## 背景

前段时间正好在接触一些陌生的技术点，为了防止遗忘一些重要的点，就想着用文档的方式记录下来。在写博客的过程中，经常会在文章中列出一些技术点关键词，比如`typescript` `node` `oss` `package-patch` `github action` ... 而这些关键词却恰恰表明了本篇文章的相关涉猎内容

然后我就在脑海中有了一个大胆的想法，可不可以实现一个工具，该工具的主要作用是**可以根据输入的博客文章路径自动生成一个关键词图片**，然后把这个关键词图片当作这篇文章的封面图，实现画龙点睛，突出博客主要涵盖技术点的目的

有了这个想法之后，我便陷入了茶不思饭不想的困境中...

在经历了一个多礼拜时长，60 次代码提交以及 1500 行有效代码实现后，它诞生了...

## 简介

这是一款可以根据用户输入的文件路径自动一键解析文件中关键词，然后随机生成一张关键词图片的工具，灵感借鉴于[前端如何实现骨架屏](https://github.com/famanoder/dps)文章。

同时为了能够满足不同场景下的用户需求，你还可以通过简单的参数配置，赋予它高可定制化的能力。于此同时，为了降低用户的使用成本，配置文件默认**不需要**经过任何配置即可实现一键生成关键词图片

功能包括但不限于：

- 支持一键生成图片
- 支持一键上传阿里云
- 支持一键上传 github
- 支持配置阿里云和 github 自定义域名
- 支持复制上传链接到剪贴板生成 md 规范的图片格式
- 支持一键校验上传权限
- 支持设置图片大小
- 支持设置字体大小
- 支持设置最大关键词数量
- 支持黑+白的主题模式
- 支持多种字体
- 支持各种文件夹命名格式
- 支持设置图片右下角作者签名
- ...

## 技术点

`nodejs`的读写和周边能力以及`canvas`的绘画能力等

主要用到了以下一些技术：

- nodejs 读写
- nodejs 周边
  - ora
  - chalk
  - commander
  - base64-img
  - copy-paste
- canvas 绘图
- ali-oss 上传图片至阿里云
- octokit 上传图片到 github
- ...

## 实现框架

![image-20220705212314712](https://show.newarray.vip/blog/dmk.png)

## 如何使用

这是个**node**工具库，它的使用方式你可以类比于你**全局**安装的**git**或者是**vue-cli**。

如果你还不知道为啥可以在安装完这些全局工具库后，你就拥有了在任何文件夹或者终端中使用它们来帮助你做一些有意思的事的原理的话。那么我的建议是你可以通过参考本工具库，实现一个属于你自己的工具脚手架，它可以辅助你做任何有意思的**魔法**的事情

言归正传，关于如何使用，我给出的答案是，你可以什么都不用做，只用执行以下几行命令：

**第一步**：全局安装该工具库

```javascript
npm install -g draw-md-keyword
```

**第二步**：去往任何具有.md 文件的文件夹中

**第三步**：一键生成项目的配置文件 dmk.config.js

```javascript
dmk init
```

**第四步**：通过命令指定要基于哪个文件一键生成你想要的关键词云图

```
dmk draw ./xxx/xxx.md
```

**第五步**：通过命令一键将图片上传到 oss 或者是 github 中，并默认帮你复制图片 md 格式到剪贴板，方便你应用在你的博客中

```
dmk github ./xxx/xxx.png
或者
dmk oss ./xxx/xxx/png
```

**注**：如果要使用上传图片的功能，需要先在第三步生成的配置文件中，进行相关有效的配置。如果你不确定自己配置是否正确的话，我依然很贴心的为你准备了一个**dmk verify**命令，辅助你校验你配置的 github 或者 oss 是否有效

```javascript
dmk verify oss
或者
dmk verify github
```

## 命令

| 支持的命令 |                                       命令阐述                                       |
| :--------: | :----------------------------------------------------------------------------------: |
|  dmk init  |               生成默认配置可用的配置文件，用户自定义配置全在这里面设置               |
|  dmk draw  | 基于你输入的 md 格式的文件路径和你的自定义配置生成一张随机样式且包含文件关键词的图片 |
|  dmk oss   |        基于你输入的 png 格式的图片路径和你的自定义配置上传图片到阿里云 oss 上        |
| dmk github |      基于你输入的 png 格式的图片路径和你的自定义配置上传图片到阿里云 github 上       |
| dmk verify | 校验你在配置文件中关于上传图片的一些参数设置项是否正确，也就是你设置的 token 对不对  |

## 配置文件

这里列出了 dmk.config.js 中的所有配置项，且都有详细的配置说明。你完全可以在自定义配置后生成你需要的关键词云图并进行上传。

```javascript
module.exports = {
  configFileName: 'dmk.config.js', // 执行dmk init后，生成的配置文件的名称，不支持改动，所有命令都会读取该文件
  initConfig: () => {
    return `const dkConfig = {
  canvasConfig: {
    width: 800, // 图片宽度
    height: 400, // 图片高度
    fontSize: 20, // 字体的默认大小，字体越大，会使生成的云图中的关键词越少
    theme: 'light', // light透明背景，dark黑色背景
    themeLightFontColor: '#000000', // theme为light情况下，绘制关键词的颜色，如果不是一个hex格式的颜色，会进行随机颜色绘制
    themeLightBorder: true, // theme为light情况下，绘制的图片是否需要边框，默认需要
    fontStyle: 'normal', // normal正常字体，italic斜体（斜体会使用Microsoft YaHei）
    fontFamily: 'paint' // 支持七种字体：brush毛笔体，cartoon卡通体，hollow镂空体，paint画刷体，kai楷体，cursive草书，newYork专供英文字体，如果设置后会选中设置的字体，否则会随机进行匹配
  },
  copyAble: true,// 是否需要在上传图片后，帮你自动复制md图片格式到剪贴板中，方便你粘贴使用
  folderName: 'dmk', // 生成图片的文件夹名称
  format: 'yyyy-mm-dd', // 生成图片的名称的前缀，不建议以/作为分隔符，因为生成时会将/当作文件夹分隔符，支持yy、mm、dd、yyyy随机排列
  max: 20, // 最多生成包括多少个关键词的云图，超出设置的值时会随机选中10个
  singleKeywordMaxLength: 10, // 单个关键词的最大长度，超出后会自动截取成...
  // 设置作者字段后，在生成的云图的右下角进行签名
  authorOption: {
    author: 'weirui88888', // 作者名
    font: {
      family: 'cursive', // 字体，支持上面的几种，选择的字体可能不能完全适应你的作者名，请选择合适的
      color: '#000000', // 字体颜色，如果在暗黑模式下，请设置正确的颜色，否则看不见～
      size: 18 // 字体大小，注：作者绘制区域在canvas画布的右下角100*100大小，过多的字体或者过大的字体导致看不见～
    }
  },
  // 支持一键上传oss，相关配置请参考 https://www.npmjs.com/package/ali-oss，只有region、accessKeyId、accessKeySecret、bucket是必须要正确填写
  oss: { 
    region: '',
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    folderName: '', // 上传图片至哪个文件夹
    host: '' // 自定义域名
  },
  // 支持一键上传github，可以利用gh-pages实现个人关键词云图集库，方便后期使用，但是貌似github对于图片的支持不太友好
  github: {
    personalAccessToken: '', // github右上角settings=>Personal access tokens=>Generate new token生成，token具备权限就选择write:packages即可
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
```

## 常见问题

### 生成图片时终端卡住

最有可能出现问题的情况是执行**dmk draw**命令，因为该命令是通过解析你的 md 输入文件中的关键词，然后进行大量的位置布局计算，寻找具备绘制条件的方案，再进行 canvas 画布绘制，最后生成图片。出现问题的原因**大概率**是你的配置文件中的一些配置导致无法正常的绘制图片，主要可能有以下几点：

- 图片长和宽过小，导致无法容纳太多的关键词
- 关键词字体大小设置过大，导致无法计算出具备绘制条件的方案
- 关键词数量过多，导致无法计算出具备绘制条件的方案
- ...

如果遇到这种问题，你只需要进行适当的参数调整，然后重新执行该命令即可

### 无法上传图片

出现这种情况只有一种可能，那就是你的相关配置项没有设置正确。比如上传阿里云 oss 的 accessKeyId 和 accessKeySecret 设置的不对，又或者是上传 github 的 personalAccessToken 没有设置正确，或者已经过期。如果你不确定的话，可以通过使用`dmk verify oss`或者`dmk verify github`来校验下你的配置是否 OK

### 已经配置了自定义域名，控制台却仍然返回不带域名的资源链接

如果你配置了自定义域名，不管是 oss 还是 github，在上传完图片的瞬间，我会通过你设置的自定义域名和图片相关路径，来验证该张图片是否是可被自定义域名访问的。有时候可能由于服务器的**缓存**或者其他原因，导致我访问时认为不存在这张图片。那我就会退而求其次，将源站图片资源链接返回给你。

这个时候你能做的就是确认两件事，一个就是确认下你的自定义域名设置是否正确，比如 oss.host 是否以 https 开头，貌似通过 http 访问这张图片，就会认为它不存在～
另一个要确认的就是，如果你是上传图片到 github 仓库中，那么你的 repo 一定得是 owner.github.io 这个仓库，这里得**owner**就是你的用户名，并且 branch**一定得是**gh-pages，如果你问我为什么，那么你就需要先去了解下 gh-pages 的含义和限制

### 上传的图片无法直接访问

这是因为阿里云的 oss bucket 安全策略，只有设置了自定义域名的 bucket 才能通过域名的形式访问 bucket 中的资源，否则通过源站资源链接访问图片时就变成了直接下载图片

**总之，为了能够降低用户的使用心智负担，我在代码实现中，做了大量的兼容处理，同时也会在执行命令出错时，贴心的告诉用户是由于什么配置项的缺失或者错误设置导致。如果你在使用的过程中，仍然有一些不解的点，可以通过[issue](https://github.com/weirui88888/draw-md-keyword/issues)来进行反馈**

## NEXT

基于用户重口难调和使用场景各异的背景，我没办法在短时间内实现更多人性化且丰富的自定义配置需求。但这只是一个**开始**，最主要的是去**做**和**实现**，很多程序员都停留在观看文档，在心里盘算着如何实现某一个功能。这无异于在浪费时间且毫无价值。因为人的记忆是有限的，并且很多时候不是你以为的就是你以为的

接下来的任务，我会基于实际的使用场景出发，继续丰富该工具库的功能，现有的想法有以下几点：

- 是否需要支持上传文件夹中所有图片，而不是一张张的上传
- 是否需要支持基于远端的**html url**链接进行绘制，这样就不用局限于只能基于本地的 md 文件进行图片生成了
- 是否需要通过命令行传参数的形式，允许用户自定义选择要进行绘制的关键词类型，现在是默认会解析出 md 文件中所有强调\*\*\*\*和转义反引号``包含的关键词
  - 支持了通过命令行传参的功能后，你就可以这样使用了：`dmk draw ./xxx/xxx.md --strong`代表你只需要基于你的文档中的加粗\*\*\*\*的关键词进行绘制，`dmk draw ./xxx/xxx.md --code`代表你只需要基于你的文档中的转义反引号``中关键词进行绘制

因为我一个人的能力和时间是有限的，就我现在回想来看，代码实现中，还是有着一些不太如人意的实现。比如：

- 如何计算，能够使得 canvas 画布的有效绘制区域更加大，并且保持着关键词不被绘制重叠的，现在是先大量的计算出不相交的圆，然后在圆中写入关键词
- 如何计算，才能使得绘制的区域不会覆盖到右下角的作者绘制区域，现在是提取作者绘制区域的一些关键点，使用 canvas 的 isPointInPath Api 能力，判断关键点不得位于即将要绘制的圆的区域内
- 暂未实现根据关键词的数量，自动的设置字体大小，让所有关键词都可以自动被绘制出来
- **关于字体读取的问题，由于这个库最终你会通过全局安装的方式在本地进行安装，绘制时使用的字体也是你本地的字体文件路径，我对现在的字体文件路径引用不太确定是否合理，或者有没有更合适的方案，因为它可能涉及到你本地 node 安装的版本有哪些，如果你有更好的见解，欢迎[prs](https://github.com/weirui88888/draw-md-keyword/pulls)**
- ...

如果这正撞到你的枪口（擅长点）上了，那么欢迎你参与进来，做强做大，造福人类

## 提示

- 由于该工具库中涵盖了几种字体，它们的体积相对来说还是偏大的，所以在全局安装的时候，可能会在网慢的情况下稍微有点慢，后续考虑如何优化
- 关于图片上传相关的密钥信息，不要随着 dmk.config.js 文件上传到你的仓库中，你可以将生成的 dmk.config.js 文件放到.gitignore 中
- 虽然 github 给我们提供了一个免费的服务器，可以用来做一些简单的项目搭建，比如博客和个人主页，但它貌似只局限于在一个仓库中使用。同时貌似对于图片的支持程度不太友好，还有就是比较慢。所以还是建议使用第三方云工具，有想配置却不会配置的，可以参考我的这篇[如何创建一个具备 cdn 加速的域名的 oss bucket](https://hexo.newarray.vip/2022/06/10/aliyun/)文章

## 参与

[![](https://img.shields.io/badge/github-@issue-green.svg?logo=github)](https://github.com/weirui88888/draw-md-keyword/issues) [![](https://img.shields.io/badge/github-@pr-green.svg?logo=github)](https://github.com/weirui88888/draw-md-keyword/pulls)
