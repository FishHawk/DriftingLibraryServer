import fs from 'fs/promises';

import { Image } from './image';

export function getExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function getBasename(filename: string): string {
  return filename.slice(0, ((filename.lastIndexOf('.') - 1) >>> 0) + 1);
}

function isImageFile(filename: string): boolean {
  const extension = getExtension(filename);
  return Image.isImageExtension(extension);
}

export async function listDirectory(
  path: string,
  withNaturalOrder: boolean
): Promise<string[]> {
  var collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return fs.readdir(path, { withFileTypes: true }).then((list) => {
    const dirnames = list
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    if (withNaturalOrder) return dirnames.sort(collator.compare);
    else return dirnames;
  });
}

export async function listImageFile(
  path: string,
  withNaturalOrder: boolean
): Promise<string[]> {
  var collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  return fs.readdir(path, { withFileTypes: true }).then((list) => {
    const filenames = list
      .filter((dirent) => dirent.isFile() && isImageFile(dirent.name))
      .map((dirent) => dirent.name);
    if (withNaturalOrder) return filenames.sort(collator.compare);
    else return filenames;
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
