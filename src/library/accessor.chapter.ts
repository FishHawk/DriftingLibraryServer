import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { Image } from '../util/image';

export class ChapterAccessor {
  constructor(private readonly dir: string) {}

  listImage(withNaturalOrder: boolean) {
    return fsu.listImageFile(this.dir, withNaturalOrder);
  }
  readImage(filename: string) {
    const imagePath = path.join(this.dir, filename);
    return fs.readFile(imagePath);
  }
  writeImage(filename: string, image: Image) {
    const imagePath = path.join(this.dir, `${filename}.${image.ext}`);
    return fs.writeFile(imagePath, image.buffer);
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
