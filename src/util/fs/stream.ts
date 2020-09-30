import fs from 'fs';
import stream from 'stream';
import util from 'util';

export const pipeline = util.promisify(stream.pipeline);
export const createReadStream = fs.createReadStream;
export const createWriteStream = fs.createWriteStream;
