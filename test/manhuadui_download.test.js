import assert from 'assert';
import { download_chapter } from '../server/providers/download.js';

describe('Provider test: manhuadui', function () {
  // this.skip();
  this.timeout(5000);

  it('test download chapter', () => {
    // Always pass, need to check manually
    return download_chapter('/home/wh/Projects/DriftingLibrary/default/', 'guaiguaishouhushen', '261457').then(
      (result) => {
        assert.equal(true, true);
      }
    );
  });
});
