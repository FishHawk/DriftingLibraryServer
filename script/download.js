import download from '../server/provider/download.js';
import provider from '../server/provider/source/manhuadui.js';

const libraryDir = '/home/wh/Projects/DriftingLibrary/default/';
const mangaId = 'guaiguaishouhushen';
download.downloadManga(provider, libraryDir, mangaId);
