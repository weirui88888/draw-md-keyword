const OSS = require('ali-oss')
const fs = require('fs')
const canvas = require('canvas')
const path = require('path')
const chalk = require('chalk')
const { generateOra, sleep, verifyParam } = require('./util')

global.Image = canvas.Image

class OssUploader {
  constructor(inputPath, userDir, userConfigPath, userConfig) {
    this.inputPath = inputPath
    this.userDir = userDir
    this.userConfigPath = userConfigPath
    this.ossOra = generateOra({
      spinner: 'runner',
      text: `马不停蹄的${chalk.green('上传')}中，请稍等...`
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
    this.validOssAccess = true
    this.oss = {
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      folderName,
      host
    }

    try {
      this.client = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket
      })
    } catch (error) {
      this.validOssAccess = false
      this.ossOra.fail(error.message)
    }
  }

  async upload() {
    if (!this.validOssAccess) return
    const unValidKeys = verifyParam(this.oss, ['host', 'folderName'])
    if (unValidKeys.length === 0) {
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
      const bucketFilePath = this.folderName ? `${this.folderName}/${imageName}` : `${imageName}`
      try {
        const res = await this.client.put(bucketFilePath, uploadPath)
        this.handle(res)
      } catch (error) {
        this.ossOra.fail(`${error.message}`)
        throw error
      }
    } else {
      const tip = unValidKeys.reduce((acc, cur, index) => {
        return index !== unValidKeys.length - 1
          ? `${acc}${chalk.yellow(cur)}、`
          : `${acc}${chalk.yellow(cur)} is ${chalk.red('required')} with command [draw github]，please ${chalk.green.bold(
              'config correctly'
            )} in ${this.userConfigPath}`
      }, 'Param ')
      this.ossOra.fail(tip)
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
              `图片已上传oss\n但是看起来你设置的oss自定义域名${chalk.red(
                this.host
              )}貌似有点问题，也许是你设置的自定义域名需要添加上${chalk.green(
                'https'
              )}协议哦\n不过你仍然可以进行访问: ${chalk.green(url)}`
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
