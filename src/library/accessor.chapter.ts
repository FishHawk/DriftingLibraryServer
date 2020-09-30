import fs from 'fs';
import fsp from 'fs/promises';
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
    return Image.fromExt(
      fsu.getExtension(filename),
      fs.createReadStream(imagePath)
    );
  }
  writeImage(filename: string, image: Image) {
    const imagePath = path.join(this.dir, `${filename}.${image.ext}`);
    return image.pipe(fs.createWriteStream(imagePath));
  }

  isUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fsu.isFileExist(markPath);
  }
  setUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fsp.writeFile(markPath, '');
  }
  setCompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fsp.unlink(markPath);
  }
}
