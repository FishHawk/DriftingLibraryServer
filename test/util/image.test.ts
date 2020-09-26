import { assert } from 'chai';
import { Image } from '../../src/util/image';

describe('Util test: image', function () {
  describe('#fromMime', () => {
    it('should return image when mime is legal', () => {
      const image = Image.fromMime('image/png', Buffer.from('placeholder'));
      assert.isDefined(image);
      assert.equal(image!.ext, 'png');
    });
    it('should return undefined when mime is illegal', () => {
      const image = Image.fromMime('image/wrong', Buffer.from('placeholder'));
      assert.isUndefined(image);
    });
  });

  describe('#fromExt', () => {
    it('should return image when ext is legal', () => {
      const image = Image.fromExt('png', Buffer.from('placeholder'));
      assert.isDefined(image);
      assert.equal(image!.mime, 'image/png');
    });
    it('should return undefined when ext is illegal', () => {
      const image = Image.fromExt('wrong', Buffer.from('placeholder'));
      assert.isUndefined(image);
    });
  });
});
