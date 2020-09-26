import { assert } from 'chai';
import Provider from '../../src/provider/providers/dmzj';
import { saveImageFile } from './util';

describe('Provider test: dmzj', function () {
  const provider = new Provider();

  it('#search', () => {
    return provider.search(1, '劫火之教典').then((result) => {
      assert.equal(result[0].metadata.title, '劫火之教典');
    });
  });

  it('#requestPopular', () => {
    return provider.requestPopular(1, { type: 0, range: 0 }).then((result) => {
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
    const option = { genre: 0, reader: 0, status: 0, area: 0, sort: 0 };
    return provider.requestCategory(1, option).then((result) => {
      assert.isArray(result);
      assert.isNotEmpty(result);
    });
  });

  const mangaId: string = '29075';
  const chapterId: string = '62412';

  it('#requestMangaDetail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '劫火之教典');
    });
  });

  it('#requestChapterContent', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 35);
    });
  });

  it('#requestImage', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.buffer.length, 103792);
        return saveImageFile(provider.name, result);
      })
    );
  });
});
