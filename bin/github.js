var exec = require('child_process').exec
function execute(cmd) {
  exec(cmd, function (error, stdout, stderr) {
    if (error) {
      console.error(error)
    } else {
      console.log('success')
    }
  })
}
execute('./bin/dmk.js github ./dmk/2022-7-3-TEST.png')
