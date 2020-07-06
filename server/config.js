import fs from 'fs';

if (process.argv.length != 4) {
  console.log(`Error! Wrong number of parameters.`);
  process.exit(1);
}

export const port = parseInt(process.argv[2]);
console.log(`Port: ${port}`);
if (!(port > 1023 && port <= 65535)) {
  console.log(`Error! Illegal port number. Should be between 1024 and 65535.`);
  process.exit(1);
}

export const libraryDir = process.argv[3];
console.log(`Library folder: ${libraryDir}`);
if (!(fs.existsSync(libraryDir) && fs.lstatSync(libraryDir).isDirectory())) {
  console.log(`Error! Library folder does not exist.`);
  process.exit(1);
}
