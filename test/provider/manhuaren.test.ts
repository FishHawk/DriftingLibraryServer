import { assert } from 'chai';
import Provider from '../../src/provider/providers/manhuaren';
import { saveImageFile } from './util';

describe('Provider test: manhuaren', function () {
  const provider = new Provider();

  it('#search', () => {
    return provider.search(1, '龙珠超').then((result) => {
      assert.equal(result[0].metadata.title, '龙珠超');
    });
  });

  it('#requestPopular', () => {
    return provider.requestPopular(1, { type: 0 }).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  it('#requestLatest', () => {
    return provider.requestLatest(1, { type: 0 }).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  it('#requestCategory', () => {
    return provider.requestCategory(1, { type: 0, sort: 0 }).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  const mangaId: string = '18657';
  const chapterId: string = '1012028';

  it('#requestMangaDetail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '龙珠超');
    });
  });

  it('#requestChapterContent', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 45);
    });
  });

  it('#requestImage', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.buffer.length, 283001);
        return saveImageFile(provider.name, result);
      })
    );
  });
});
