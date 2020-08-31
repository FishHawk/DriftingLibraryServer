import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';

export class AccessorChapter {
  constructor(private readonly dir: string) {}

  async listImage(): Promise<string[]> {
    return fsu.listImageFileWithNaturalOrder(this.dir);
  }

  async readImage(filename: string): Promise<Buffer> {
    const imagePath = path.join(this.dir, filename);
    return fs.readFile(imagePath);
  }

  async writeImage(filename: string, data: Buffer) {
    const imagePath = path.join(this.dir, filename);
    return fs.writeFile(imagePath, data);
  }

  async isImageExist(filename: string): Promise<boolean> {
    const imagePath = path.join(this.dir, filename);
    return fsu.isFileExist(imagePath);
  }
}
