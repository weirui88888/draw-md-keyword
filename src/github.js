const fs = require('fs')
const canvas = require('canvas')
const path = require('path')
const chalk = require('chalk')
const { Octokit } = require('@octokit/core')
const { restEndpointMethods } = require('@octokit/plugin-rest-endpoint-methods')
const { generateOra, sleep } = require('./util')
const GithubOctokit = Octokit.plugin(restEndpointMethods)
const imageToBase64 = require('image-to-base64')
global.Image = canvas.Image

class GithubUploader {
  constructor(inputPath, userDir, userConfig) {
    this.inputPath = inputPath
    this.userDir = userDir
    this.githubOra = generateOra({
      spinner: 'runner',
      text: '马不停蹄的上传中，请稍等...'
    })
    const { personalAccessToken = '' } = userConfig
    this.githubOctokit = new GithubOctokit({ auth: personalAccessToken })
  }

  async getBase64Content(uploadPath) {
    return await imageToBase64(uploadPath)
  }

  async upload() {
    // 处理错误
    const uploadPath = path.join(this.userDir, this.inputPath)
    const content = await this.getBase64Content(uploadPath)
    const res = await this.githubOctokit.rest.repos.createOrUpdateFileContents({
      owner: 'weirui88888',
      repo: 'weirui88888.github.io',
      path: 'dark-draw-md-keyword.png',
      branch: 'gh-pages',
      message: ':tada:success create file to repo',
      content: content
    })
    console.log(res)
  }

  async handle(res) {
    const { name, url } = res
    if (res.res.statusCode === 200) {
      if (this.host) {
        const hostUrl = `${this.host}/${name}`
        this.checkValidImage(hostUrl)
          .then(() => {
            this.githubOra.succeed(`图片已上传github，访问地址为: ${chalk.green(hostUrl)}`)
          })
          .catch(() => {
            this.githubOra.warn(
              `图片已上传github，但是看起来你设置的github自定义域名${chalk.red(
                this.host
              )}貌似有点问题，不过你仍然可以进行访问: ${chalk.green(url)}`
            )
          })
      } else {
        this.githubOra.succeed(`图片已上传github，访问地址为: ${chalk.green(url)}`)
      }
    } else {
      this.githubOra.fail('仿佛出现了点错误，别灰心，请重新生成图片后再次执行该命令...')
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

module.exports = GithubUploader
