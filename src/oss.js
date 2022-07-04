const OSS = require('ali-oss')
const fs = require('fs')
const canvas = require('canvas')
const path = require('path')
const chalk = require('chalk')
const { generateOra, sleep } = require('./util')

global.Image = canvas.Image

class OssUploader {
  constructor(inputPath, userDir, userConfig) {
    this.inputPath = inputPath
    this.userDir = userDir
    this.ossOra = generateOra({
      spinner: 'runner',
      text: '马不停蹄的上传中，请稍等...'
    })
    const {
      oss = {
        region: '',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: '',
        folderName: '',
        host: ''
      }
    } = userConfig
    const { region, accessKeyId, accessKeySecret, bucket, folderName, host } = oss
    this.folderName = folderName
    this.host = host
    this.client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket
    })
  }

  async upload() {
    this.ossOra.start()
    await sleep(2)
    const uploadPath = path.resolve(this.userDir, this.inputPath)
    if (!fs.existsSync(uploadPath)) {
      return this.ossOra.fail(
        `according to your input, the image is not found, please use the command again ${chalk.green(
          'after use [dwk draw <md filePath>]'
        )}`
      )
    }
    const dirnamePath = path.dirname(uploadPath)
    const imageName = uploadPath.replace(`${dirnamePath}/`, '')

    try {
      const res = await this.client.put(`${this.folderName}/${imageName}`, uploadPath)
      this.handle(res)
    } catch (error) {
      this.ossOra.fail(`${error.message}`)
      throw error
    }
  }

  handle(res) {
    const { name, url } = res
    if (res.res.statusCode === 200) {
      if (this.host) {
        const hostUrl = `${this.host}/${name}`
        this.checkValidImage(hostUrl)
          .then(() => {
            this.ossOra.succeed(`图片已上传oss，访问地址为: ${chalk.green(hostUrl)}`)
          })
          .catch(() => {
            this.ossOra.warn(
              `图片已上传oss，但是看起来你设置的oss自定义域名${chalk.red(
                this.host
              )}貌似有点问题，不过你仍然可以进行访问: ${chalk.green(url)}`
            )
          })
      } else {
        this.ossOra.succeed(`图片已上传oss，访问地址为: ${chalk.green(url)}`)
      }
    } else {
      this.ossOra.fail('仿佛出现了点错误，别灰心，请重新生成图片后再次执行该命令...')
    }
  }

  // node中 new Image暂未实现...
  checkValidImage(url) {
    return new Promise((res, rej) => {
      const image = new Image()
      image.onload = () => {
        res({
          valid: true
        })
      }
      image.onerror = () => {
        rej({
          valid: false
        })
      }
      image.src = url
    })
  }
}

module.exports = OssUploader
