const fs = require('fs')
const canvas = require('canvas')
const path = require('path')
const chalk = require('chalk')
const { Octokit } = require('@octokit/core')
const { restEndpointMethods } = require('@octokit/plugin-rest-endpoint-methods')
const { generateOra, verifyParam, verifyImage } = require('./util')
const GithubOctokit = Octokit.plugin(restEndpointMethods)
const imageToBase64 = require('image-to-base64')
global.Image = canvas.Image

class GithubUploader {
  constructor(inputPath, userDir, userConfigPath, userConfig) {
    this.inputPath = inputPath
    this.userDir = userDir
    this.userConfigPath = userConfigPath
    const {
      github = {
        personalAccessToken: '',
        owner: '',
        repo: '',
        branch: '',
        imgPath: '',
        customDomain: ''
      }
    } = userConfig
    const { personalAccessToken, owner, repo, branch, imgPath, customDomain } = github
    this.requireParam = {
      personalAccessToken,
      owner,
      repo,
      branch,
      imgPath,
      customDomain
    }
    this.githubOra = generateOra({
      spinner: 'runner'
    })
    this.githubOctokit = new GithubOctokit({ auth: this.requireParam.personalAccessToken })
  }

  async getBase64Content(uploadPath) {
    return await imageToBase64(uploadPath)
  }

  async upload() {
    const unValidKeys = verifyParam(this.requireParam, 'customDomain')
    if (unValidKeys.length === 0) {
      const uploadPath = path.join(this.userDir, this.inputPath)
      const dirnamePath = path.dirname(uploadPath)
      const imageName = uploadPath.replace(`${dirnamePath}/`, '')
      if (!fs.existsSync(uploadPath)) {
        return this.githubOra.fail(
          `according to your input, the image is not found, please use the command again ${chalk.green(
            'after use [dwk draw <md filePath>]'
          )}`
        )
      }
      const { owner, repo, imgPath, branch } = this.requireParam
      const uploadRepoPath = path.join(imgPath, imageName)
      const message = `:tada:dmk generated ${imageName}`
      this.githubOra.start(`马不停蹄的${chalk.green('编码')}中，请稍等...`)
      const content = await this.getBase64Content(uploadPath)
      const sha = await this.getContentSha({
        owner,
        repo,
        path: uploadRepoPath,
        ref: branch
      })
      if (sha) {
        this.githubOra.start(
          `马不停蹄的${chalk.green('更新资源')}中，请稍等...（注意可能有${chalk.green(
            '缓存'
          )}导致更新资源没有及时生效，等等即可）`
        )
        const res = await this.githubOctokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: uploadRepoPath,
          branch,
          message,
          content,
          sha
        })
        this.handle(res)
      } else {
        this.githubOra.start(`马不停蹄的${chalk.green('上传')}中，请稍等...`)
        const res = await this.githubOctokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: uploadRepoPath,
          branch,
          message,
          content
        })
        this.handle(res)
      }
    } else {
      const tip = unValidKeys.reduce((acc, cur, index) => {
        return index !== unValidKeys.length - 1
          ? `${acc}${chalk.yellow(cur)}、`
          : `${acc}${chalk.yellow(cur)} is ${chalk.red('required')} with command [draw github]，please ${chalk.green.bold(
              'config correctly'
            )} in ${this.userConfigPath}`
      }, 'Param ')
      this.githubOra.fail(tip)
    }
  }

  async getContentSha({ owner, repo, path, ref }) {
    try {
      const res = await this.githubOctokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      })
      return res.data.sha
    } catch (error) {
      return Promise.resolve('')
    }
  }

  handle(res) {
    const {
      status,
      data: {
        content: { path, download_url }
      }
    } = res
    if (status === 200 || status === 201) {
      const host = this.requireParam.customDomain
      if (host) {
        const hostUrl = `${host}/${path}`
        verifyImage(hostUrl)
          .then(() => {
            this.githubOra.succeed(`图片已上传github，访问地址为: ${chalk.green(hostUrl)}`)
          })
          .catch(() => {
            this.githubOra.warn(
              `图片已上传github，但是看起来你设置的github自定义域名${chalk.red(
                host
              )}貌似有点问题，不过你仍然可以进行访问: ${chalk.green(download_url)}`
            )
          })
      } else {
        this.githubOra.succeed(`图片已上传github，访问地址为: ${chalk.green(download_url)}`)
      }
    } else {
      // TODO:错误提示示例以及解释
      this.githubOra.fail('仿佛出现了点错误，别灰心，请重新生成图片后再次执行该命令...')
    }
  }
}

module.exports = GithubUploader
