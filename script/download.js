import download from '../server/download/download.js';
import provider from '../server/download/providers/manhuadui.js';

const libraryDir = '/home/wh/Projects/DriftingLibrary/default/';
const mangaId = 'guaiguaishouhushen';
download.downloadManga(provider, libraryDir, mangaId);
