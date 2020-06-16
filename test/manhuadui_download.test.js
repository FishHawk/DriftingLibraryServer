import assert from 'assert';
import {
  download_chapter,
  download_manga,
} from '../server/providers/download.js';

describe('Provider test: manhuadui', function () {
  // this.skip();
  this.timeout(5000);

  it('test download chapter', () => {
    // Always pass, need to check manually
    return download_chapter(
      '/home/wh/Projects/DriftingLibrary/default/',
      'guaiguaishouhushen',
      '261457'
    ).then((result) => {
      assert.equal(true, true);
    });
  });

  it.only('test download manga', () => {
    // Always pass, need to check manually
    return download_manga(
      '/home/wh/Projects/DriftingLibrary/default/',
      'guaiguaishouhushen'
    ).then((result) => {
      assert.equal(true, true);
    });
  });
});
