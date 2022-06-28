const fs = require("fs")
const chalk = require("chalk")
const log = console.log
const commonMark = require("commonMark")

const greenLog = (message) => {
  log(chalk.green(message))
}

const redLog = (message) => {
  log(chalk.red(message))
}

const getUserConfig = (path) => {
  if (!fs.existsSync(path)) {
    return redLog(`please run 'dk init' to initialize a config file`)
  }
  return require(path)
}

const pickKeywords = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return redLog(`${filePath} does not exist, please confirm and execute again `)
  }
  const markdown = fs.readFileSync(filePath, { encoding: "utf8" })
  let parsed = new commonMark.Parser().parse(markdown)
  let walker = parsed.walker()
  let event
  let nodeList = []
  let st = []
  while ((event = walker.next())) {
    let node = event.node
    if (node.type === "code" && node.literal) {
      nodeList.push(node)
    }
    if (node.type === "strong" && node.firstChild._literal) {
      st.push(node)
    }
  }

  const literals = nodeList.map((node) => node.literal)
  const sts = st.map((node) => node.firstChild.literal)
  const all = [...new Set([...literals, ...sts])]
  console.log(all)
}

exports.getUserConfig = getUserConfig
exports.greenLog = greenLog
exports.redLog = redLog
exports.pickKeywords = pickKeywords
