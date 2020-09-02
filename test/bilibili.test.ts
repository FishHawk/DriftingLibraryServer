import assert from 'assert';
import Provider from '../src/provider/providers/bilibili';
import { saveImageFile } from './util';

describe('Provider test: bilibili', function () {
  const provider = new Provider();
  it('test search', () => {
    return provider.search(1, '迷宫饭').then((result) => {
      assert.equal(result[0].metadata.title, '迷宫饭');
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

  it('test request manga detail', () => {
    return provider.requestMangaDetail('28284').then((result) => {
      assert.equal(result.metadata.title, '迷宫饭');
    });
  });

  let imageUrl: string | undefined = undefined;
  it('test request chapter content', () => {
    return provider.requestChapterContent('28284/466261').then((result) => {
      imageUrl = result[0];
      assert.equal(result.length, 42);
    });
  });

  it('test request image', () => {
    return provider.requestImage(imageUrl!).then((result) => {
      assert.equal(result.length, 2008111);
      return saveImageFile(provider.name, result.slice());
    });
  });
});
