import assert from 'assert';
import Provider from '../src/provider/providers/manhuaren';
import { saveImageFile } from './util';

describe('Provider test: manhuaren', function () {
  const provider = new Provider();

  it('test search', () => {
    return provider.search(1, '龙珠超').then((result) => {
      assert.equal(result[0].metadata.title, '龙珠超');
    });
  });

  it('test request popular mangas', () => {
    return provider.requestPopular(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  it('test request latest update', () => {
    return provider.requestLatest(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  const mangaId: string = '18657';
  const chapterId: string = '1012028';

  it('test request manga detail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '龙珠超');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 45);
    });
  });

  it('test request image', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.length, 283001);
        return saveImageFile(provider.name, result.slice());
      })
    );
  });
});
