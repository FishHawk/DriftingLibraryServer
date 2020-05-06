const ipcRenderer = require('electron').ipcRenderer;
const app = require('electron').remote.app;
const proc = require('child_process');
const fs = require('fs');

let expressProcess = undefined;

document.getElementById('button').addEventListener('click', () => {
  const port = parseInt(document.getElementById('port').value);
  if (!(port > 1023 && port <= 65535)) {
    alert(`错误！ 不合法的端口号，端口号应当在1024到65535之间。`);
    return;
  }

  const address = document.getElementById('address').value;
  if (!(fs.existsSync(address) && fs.lstatSync(address).isDirectory())) {
    alert(`错误！ 库文件夹不存在。`);
    return;
  }

  startServer(port, address);
});

function strip(s) {
  // regex from: http://stackoverflow.com/a/29497680/170217
  return s.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
}

function redirectOutput(x) {
  const log = document.getElementById('log');
  x.on('data', function (data) {
    log.value += data.toString();
  });
}

function startServer(port, address) {
  if (expressProcess == undefined) {
    expressProcess = proc.spawn('./node_modules/node/bin/node', ['./server/index.js', port, address], {
      cwd: app.getAppPath(),
    });
    redirectOutput(expressProcess.stdout);
    redirectOutput(expressProcess.stderr);
  }
}

ipcRenderer.on('stop-server', (event, data) => {
  expressProcess.kill('SIGINT');
});
