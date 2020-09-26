import { assert } from 'chai';
import Provider from '../../src/provider/providers/bilibili';
import { saveImageFile } from './util';

describe('Provider test: bilibili', function () {
  const provider = new Provider();

  it('#search', () => {
    return provider.search(1, '迷宫饭').then((result) => {
      assert.equal(result[0].metadata.title, '迷宫饭');
    });
  });

  it('#requestPopular', () => {
    return provider.requestPopular(1, { type: 0 }).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  it('#requestLatest', () => {
    return provider.requestLatest(1).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  it('#requestCategory', () => {
    const option = { style: 0, area: 0, isFinish: 0, isFree: 0, order: 0 };
    return provider.requestCategory(1, option).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  const mangaId: string = '28284';
  const chapterId: string = '466261';

  it('#requestMangaDetail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '迷宫饭');
    });
  });

  it('#requestChapterContent', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 42);
    });
  });

  it('#requestImage', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.buffer.length, 2008111);
        return saveImageFile(provider.name, result);
      })
    );
  });
});
