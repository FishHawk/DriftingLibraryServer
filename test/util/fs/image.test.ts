import { assert } from 'chai';
import { Readable } from 'stream';
import { Image } from '../../../src/util/fs/image';

describe('Util test: fs image', function () {
  describe('#fromMime', () => {
    it('should return image when mime is legal', () => {
      const image = Image.fromMime('image/png', Readable.from('placeholder'));
      assert.isDefined(image);
      assert.equal(image!.ext, 'png');
    });
    it('should return undefined when mime is illegal', () => {
      const image = Image.fromMime('image/wrong', Readable.from('placeholder'));
      assert.isUndefined(image);
    });
  });

  describe('#fromExt', () => {
    it('should return image when ext is legal', () => {
      const image = Image.fromExt('png', Readable.from('placeholder'));
      assert.isDefined(image);
      assert.equal(image!.mime, 'image/png');
    });
    it('should return undefined when ext is illegal', () => {
      const image = Image.fromExt('wrong', Readable.from('placeholder'));
      assert.isUndefined(image);
    });
  });
});
