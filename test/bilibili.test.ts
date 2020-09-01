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

  //   it('test request popular mangas', () => {
  //     return provider.requestPopular(1).then((result) => {
  //       assert.equal(result.length, 20);
  //     });
  //   });

  //   it('test request latest update', () => {
  //     return provider.requestLatest(1).then((result) => {
  //       assert.equal(result.length, 20);
  //     });
  //   });

  it('test request manga detail', () => {
    return provider.requestMangaDetail('28284').then((result) => {
      assert.equal(result.metadata.title, '迷宫饭');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent('28284/466261').then((result) => {
      assert.equal(result.length, 42);
    });
  });

  it('test request image', () => {
    const url =
      'https://i0.hdslb.com/bfs/manga/2e9cf3ee284acc1512041f136be860abb36699e3.jpg?' +
      'token=73441250b03e3f16%3AYxe8xvRiocj6f6juBrl4VA78Uow%3D%3A1598980627';
    return provider.requestImage(url).then((result) => {
      assert.equal(result.length, 265896);
      return saveImageFile(provider.name, result.slice());
    });
  });
});
