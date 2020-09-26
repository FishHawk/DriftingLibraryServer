import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../../src/util/fs';
import { Image } from '../../src/util/image';

const isEnabled = true;
const imageFileDir = './test/provider/result';

export async function saveImageFile(providerId: string, image: Image) {
  if (isEnabled) {
    if (!(await fsu.isDirectoryExist(imageFileDir)))
      await fs.mkdir(imageFileDir);
    const filename = path.join(imageFileDir, `${providerId}.${image.ext}`);
    return fs.writeFile(filename, image.buffer);
  }
}
