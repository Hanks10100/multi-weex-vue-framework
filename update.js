const fs = require('fs')
const semver = require('semver')
const jsonfile = require('jsonfile')
const child_process = require('child_process')
const versions = require('./versions.json')

function isInstalled (version) {
  return versions.some(v => semver.satisfies(version, v))
}

function exec (command) {
  const tasks = Array.isArray(command) ? command : [command]
  let res = ''
  tasks.forEach(function (task) {
    console.log(' =>', task)
    res = child_process.execSync(task)
  })
  return res.toString()
}

let targetVersion = process.argv[2]
let isLatest = false

if (!targetVersion || targetVersion === 'latest') {
  targetVersion = exec(`npm view weex-vue-framework version`).trim()
  isLatest = true
}

if (isInstalled(targetVersion)) {
  console.log(` => weex-vue-framework@${targetVersion} is already installed.`)
  process.exit()
}

exec([
  `npm install weex-vue-framework@${targetVersion} -E`
])

const filePath = `${semver.major(targetVersion)}.${semver.minor(targetVersion)}.${semver.patch(targetVersion)}`
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath)
}

exec([
  `cp -r node_modules/weex-vue-framework/ ${filePath}/${targetVersion}`,
  `cp -r node_modules/weex-vue-framework/ ${filePath}/${targetVersion}`,
])

if (isLatest) {
  exec([
    `cp node_modules/weex-vue-framework/index.js ${filePath}/index.js`,
    `cp node_modules/weex-vue-framework/factory.js ${filePath}/factory.js`,
    `cp node_modules/weex-vue-framework/index.js index.js`,
    `cp node_modules/weex-vue-framework/factory.js factory.js`
  ])
}

versions.push(targetVersion)
versions.sort((a, b) => semver.gt(a, b) ? 1 : -1)
jsonfile.writeFileSync('./versions.json', versions, { spaces: 2 })

exec([
  `git add -A`,
  `git commit -m "add v${targetVersion}"`
])
