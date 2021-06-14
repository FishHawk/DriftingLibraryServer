import path from 'path';

import * as fs from '../util/fs';
import { validateString } from '../util/validator/validator';

import { MangaAccessor } from './accessor.manga';
import { searchLibrary } from './search';

export class LibraryAccessor {
  static readonly mangaIdValidator = validateString().isFilename();

  constructor(readonly dir: string) {}

  async listManga(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ) {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  validateMangaId(mangaId: string) {
    return LibraryAccessor.mangaIdValidator.validate(mangaId);
  }

  async isMangaExist(mangaId: string) {
    const mangaDir = path.join(this.dir, mangaId);
    return await fs.isDirectoryExist(mangaDir);
  }

  async createManga(mangaId: string) {
    const mangaDir = path.join(this.dir, mangaId);
    await fs.mkdir(mangaDir);
  }

  async deleteManga(mangaId: string) {
    const mangaDir = path.join(this.dir, mangaId);
    await fs.rmdir(mangaDir, { recursive: true });
  }

  async getManga(mangaId: string) {
    return new MangaAccessor(this.dir, mangaId);
  }
}
