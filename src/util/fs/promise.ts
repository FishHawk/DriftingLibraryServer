import fs from 'fs/promises';
import { Image } from './image';

export const mkdir = fs.mkdir;
export const rmdir = fs.rmdir;
export const unlink = fs.unlink;

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

function listdir(dirpath: string) {
  return fs.readdir(dirpath, { withFileTypes: true });
}

export function listDirectory(
  path: string,
  sort: 'natural' | undefined = undefined
) {
  return listdir(path).then((list) => {
    const dirnames = list
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (sort) {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return dirnames.sort(collator.compare);
    } else return dirnames;
  });
}

export function listImageFile(
  path: string,
  sort: 'natural' | undefined = undefined
) {
  return listdir(path).then((list) => {
    const filenames = list
      .filter((dirent) => dirent.isFile() && isImageFile(dirent.name))
      .map((dirent) => dirent.name);

    if (sort) {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return filenames.sort(collator.compare);
    } else return filenames;
  });
}

export function getMTime(path: string) {
  return fs.stat(path).then((it) => it.mtime.getTime());
}

export function setMTime(path: string, mtime: number) {
  return fs.stat(path).then((it) => fs.utimes(path, it.atime, mtime));
}

export function isPathExist(path: string) {
  return fs
    .stat(path)
    .then(() => true)
    .catch(() => false);
}

export function isFileExist(path: string) {
  return fs
    .stat(path)
    .then((it) => it.isFile())
    .catch(() => false);
}

export function isDirectoryExist(path: string) {
  return fs
    .stat(path)
    .then((it) => it.isDirectory())
    .catch(() => false);
}

export function readJSON(path: string) {
  return fs
    .readFile(path, 'utf8')
    .then((it) => JSON.parse(it))
    .catch(() => undefined);
}

export function writeJSON(path: string, obj: any) {
  return fs.writeFile(path, JSON.stringify(obj));
}
