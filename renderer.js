const { ipcRenderer } = require('electron');
const fs = require('fs');

document.getElementById('button').addEventListener('click', () => {
  const port = parseInt(document.getElementById('port').value);
  if (!(port > 1023 && port <= 65535)) {
    alert(`错误！ 不合法的端口号，端口号应当在1024到65535之间。`);
    return
  }

  const address = document.getElementById('address').value;
  if (!(fs.existsSync(address) && fs.lstatSync(address).isDirectory())) {
    alert(`错误！ 库文件夹不存在。`);
    return
  }

  ipcRenderer.send('start-server', { port: port, address: address });
});

ipcRenderer.on('notify', function (event, content) {
  alert(content);
});
