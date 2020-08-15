import fs from 'fs/promises';

function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

function isImageFile(filename: string): boolean {
  const extension = getFileExtension(filename).toLowerCase();
  const possibleExtensions = ['jpg', 'png', 'jpeg'];
  return possibleExtensions.includes(extension);
}

export async function listDirectoryWithNaturalOrder(path: string): Promise<string[]> {
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return fs.readdir(path, { withFileTypes: true }).then((list) => {
    return list
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .sort(collator.compare);
  });
}

export async function listImageFileWithNaturalOrder(path: string): Promise<string[]> {
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return fs.readdir(path, { withFileTypes: true }).then((list) => {
    return list
      .filter((dirent) => dirent.isFile() && isImageFile(dirent.name))
      .map((dirent) => dirent.name)
      .sort(collator.compare);
  });
}

export async function isFileExist(path: string): Promise<boolean> {
  return fs
    .stat(path)
    .then((x) => x.isFile())
    .catch(() => false);
}

export async function isDirectoryExist(path: string): Promise<boolean> {
  return fs
    .stat(path)
    .then((x) => x.isDirectory())
    .catch(() => false);
}

export async function readJSON(path: string): Promise<any> {
  return fs
    .readFile(path, 'utf8')
    .then((x) => JSON.parse(x))
    .catch(() => undefined);
}
