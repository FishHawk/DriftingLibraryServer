if (process.argv.length != 4) {
  console.log(`错误的参数个数。`);
  process.exit(1);
}

const port = parseInt(process.argv[2]);
console.log(`端口号：${port}`);
if (!(port > 1023 && port <= 65535)) {
  console.log(`错误！ 不合法的端口号，端口号应当在1024到65535之间。`);
  process.exit(1);
}

const libraryDir = process.argv[3];
const fs = require('fs');
console.log(`库文件夹：${libraryDir}`);
if (!(fs.existsSync(libraryDir) && fs.lstatSync(libraryDir).isDirectory())) {
  console.log(`错误！ 库文件夹不存在。`);
  process.exit(1);
}

// module.exports = {
//   port: 8080,
//   libraryDir: '/home/wh/Projects/DriftingLibrary/test-short-10000/',
// };
module.exports = {
  port: port,
  libraryDir: libraryDir
};
