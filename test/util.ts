import fs from 'fs/promises';
import path from 'path';
import * as fsu from '../src/util/fs';

const isEnabled = true;
const imageFileDir = './test/result';

export async function saveImageFile(providerId: string, data: Buffer) {
  if (isEnabled) {
    if (!(await fsu.isDirectoryExist(imageFileDir))) await fs.mkdir(imageFileDir);
    const filename = path.join(imageFileDir, `${providerId}.jpg`);
    return fs.writeFile(filename, data);
  }
}
