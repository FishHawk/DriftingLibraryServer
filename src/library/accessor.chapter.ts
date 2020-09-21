import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';

export class ChapterAccessor {
  constructor(private readonly dir: string) {}

  listImage() {
    return fsu.listImageFileWithNaturalOrder(this.dir);
  }
  readImage(filename: string) {
    const imagePath = path.join(this.dir, filename);
    return fs.readFile(imagePath);
  }
  writeImage(filename: string, data: Buffer) {
    const imagePath = path.join(this.dir, filename);
    return fs.writeFile(imagePath, data);
  }
  isImageExist(filename: string) {
    const imagePath = path.join(this.dir, filename);
    return fsu.isFileExist(imagePath);
  }

  isUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fsu.isFileExist(markPath);
  }
  setUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fs.writeFile(markPath, '');
  }
  setCompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fs.unlink(markPath);
  }
}
