import path from 'path';

import * as fs from '@util/fs';

export class ChapterAccessor {
  constructor(private readonly dir: string) {}

  async listImage() {
    return (await fs.listImageFile(this.dir, 'natural')).filter(
      (filename) => fs.getBasename(filename) !== 'thumb'
    );
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

  async hasUncompleteMark() {
    const markPath = path.join(this.dir, '.uncomplete');
    return fs.isFileExist(markPath);
  }
  async addUncompleteMark() {
    const markPath = path.join(this.dir, '.uncomplete');
    if (!(await fs.isFileExist(markPath))) {
      await fs.writeJSON(markPath, {});
    }
  }
  async removeUncompleteMark() {
    const markPath = path.join(this.dir, '.uncomplete');
    if (await fs.isFileExist(markPath)) await fs.unlink(markPath);
  }
}
