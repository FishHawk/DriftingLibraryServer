import { download_manga } from '../server/providers/download.js';

const libraryDir = '/home/wh/Projects/DriftingLibrary/default/';
const mangaId = 'guaiguaishouhushen';
download_manga(libraryDir, mangaId);
