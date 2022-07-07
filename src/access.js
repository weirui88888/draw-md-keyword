const { Octokit } = require('@octokit/core')
const { restEndpointMethods } = require('@octokit/plugin-rest-endpoint-methods')
const GithubOctokit = Octokit.plugin(restEndpointMethods)
const OSS = require('ali-oss')
const chalk = require('chalk')
const { commandGithub, commandOss, generateOra, sleep } = require('./util')
class Access {
  constructor(type, userDir, userConfigPath, userConfig) {
    this.type = type
    this.userDir = userDir
    this.userConfigPath = userConfigPath
    this.userConfig = userConfig
    this.accessOra = generateOra({
      spinner: 'monkey'
    })
  }

  verify() {
    if (this.type === commandGithub) {
      this.verifyGithub()
    } else if (this.type === commandOss) {
      this.verifyOss()
    }
  }
  async verifyGithub() {
    this.accessOra.start(`正在根据你设置的github personalAccessToken验证是否具备github api权限，请稍等...`)
    await sleep(2)
    const {
      github = {
        personalAccessToken: ''
      }
    } = this.userConfig
    const { personalAccessToken } = github
    const octokit = new GithubOctokit({ auth: personalAccessToken })
    try {
      const res = await octokit.rest.users.getAuthenticated()
      const {
        status,
        data: { login }
      } = res
      if (status === 200) {
        this.accessOra.succeed(
          `🎉 恭喜你：${chalk.green(login)}\ngithub personalAccessToken验证成功，快去生成图片并上传到github任意仓库中吧`
        )
      }
    } catch (error) {
      this.accessOra.fail(
        `😭 看起来你设置的github personalAccessToken有点问题，请重新生成token及配置后再次尝试\n配置路径:${
          this.userConfigPath
        }\n报错信息为：${chalk.red(error.message)}`
      )
    }
  }
  async verifyOss() {
    this.accessOra.start(`正在根据你设置的oss配置信息校验是否具备上传权限，请稍等...`)
    await sleep(2)
    const {
      oss = {
        region: '',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: ''
      }
    } = this.userConfig

    const { region, accessKeyId, accessKeySecret, bucket } = oss
    try {
      const store = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket
      })
      const bucketInfo = await store.getBucketInfo(bucket)
      const { status } = bucketInfo?.res
      const { Name } = bucketInfo?.bucket
      if (status === 200) {
        this.accessOra.succeed(
          `🎉 恭喜你：${chalk.green(`oss相关配置已生效，你操作的bucket是${Name}`)}\n快去生成图片并上传到oss bucket中吧`
        )
      }
    } catch (error) {
      this.accessOra.fail(
        `😭 看起来你的oss配置有点问题，请修改后后再次尝试\n报错信息为：${chalk.red(error.message)}\n配置路径:${
          this.userConfigPath
        }`
      )
    }
  }
}
module.exports = Access
