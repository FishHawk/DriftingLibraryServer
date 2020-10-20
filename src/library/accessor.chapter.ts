import path from 'path';

import * as fs from '../util/fs';

export class ChapterAccessor {
  constructor(private readonly dir: string) {}

  listImage() {
    return fs.listImageFile(this.dir, 'natural');
  }
  readImage(filename: string) {
    const imagePath = path.join(this.dir, filename);
    return fs.Image.fromExt(
      fs.getExtension(filename),
      fs.createReadStream(imagePath)
    );
  }
  writeImage(filename: string, image: fs.Image) {
    const imagePath = path.join(this.dir, `${filename}.${image.ext}`);
    return image.pipe(fs.createWriteStream(imagePath));
  }

  async isUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    return fs.isFileExist(markPath);
  }
  async setUncompleted() {
    const markPath = path.join(this.dir, '.mark');
    if (!fs.isFileExist(markPath)) await fs.writeJSON(markPath, {});
  }
  async setCompleted() {
    const markPath = path.join(this.dir, '.mark');
    if (fs.isFileExist(markPath)) await fs.unlink(markPath);
  }
}
