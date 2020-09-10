import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { StringValidator } from '../util/validator';

import * as Entity from './entity';
import { AccessorManga } from './accessor.manga';
import { searchLibrary } from './search';

export class AccessorLibrary {
  static readonly mangaIdValidator = new StringValidator().isFilename();

  constructor(readonly dir: string) {}

  async search(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ): Promise<Entity.MangaOutline[]> {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  async isMangaExist(mangaId: string): Promise<boolean> {
    if (!this.validateMangaId(mangaId)) return false;
    const mangaDir = path.join(this.dir, mangaId);
    return fsu.isDirectoryExist(mangaDir);
  }

  async createManga(mangaId: string): Promise<void> {
    if (!this.validateMangaId(mangaId)) return;
    const mangaDir = path.join(this.dir, mangaId);
    if (await fsu.isDirectoryExist(mangaDir)) return;
    return fs.mkdir(mangaDir);
  }

  async deleteManga(mangaId: string): Promise<void> {
    if (!this.validateMangaId(mangaId)) return;
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fsu.isDirectoryExist(mangaDir))) return;
    return fs.rmdir(mangaDir, { recursive: true });
  }

  async openManga(mangaId: string) {
    if (!(await this.isMangaExist(mangaId))) return undefined;
    return new AccessorManga(this.dir, mangaId);
  }

  private validateMangaId(mangaId: string) {
    return AccessorLibrary.mangaIdValidator.validate(mangaId);
  }
}
