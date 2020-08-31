import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { validateFilename } from '../util/validate';

import { MangaOutline } from './entity/manga_outline';
import { AccessorManga } from './accessor.manga';
import { searchLibrary } from './search';

export class AccessorLibrary {
  constructor(readonly dir: string) {}

  async search(lastTime: number, limit: number, keywords: string): Promise<MangaOutline[]> {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  async isMangaExist(mangaId: string): Promise<boolean> {
    if (!this.validateMangaId(mangaId)) return false;
    const mangaDir = path.join(this.dir, mangaId);
    return fsu.isDirectoryExist(mangaDir);
  }

  async createManga(mangaId: string): Promise<void> {
    const mangaDir = path.join(this.dir, mangaId);
    if (fsu.isDirectoryExist(mangaDir)) return;
    return fs.mkdir(mangaDir);
  }

  async deleteManga(mangaId: string): Promise<void> {
    const mangaDir = path.join(this.dir, mangaId);
    if (!fsu.isDirectoryExist(mangaDir)) return;
    return fs.rmdir(mangaDir, { recursive: true });
  }

  async openManga(mangaId: string) {
    if (!(await this.isMangaExist(mangaId))) return undefined;
    return new AccessorManga(this.dir, mangaId);
  }

  private validateMangaId(mangaId: string) {
    return validateFilename(mangaId);
  }
}
