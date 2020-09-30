import path from 'path';

import * as fs from '../../src/util/fs';

const isEnabled = true;
const imageFileDir = './test/provider/result';

export async function saveImageFile(providerId: string, image: fs.Image) {
  if (isEnabled) {
    if (!(await fs.isDirectoryExist(imageFileDir)))
      await fs.mkdir(imageFileDir);
    const filepath = path.join(imageFileDir, `${providerId}.${image.ext}`);
    return image.pipe(fs.createWriteStream(filepath));
  }
}
