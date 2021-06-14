import path from 'path';

import * as fs from '../util/fs';
import { BadRequestError, NotFoundError } from '../controller/exception';
import { validateString } from '../util/validator/validator';

import * as Entity from './entity';
import { MangaAccessor } from './accessor.manga';
import { searchLibrary } from './search';

export class LibraryAccessor {
  static readonly mangaIdValidator = validateString().isFilename();

  constructor(readonly dir: string) {}

  async listManga(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ): Promise<Entity.MangaOutline[]> {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  async ensureManga(mangaId: string): Promise<MangaAccessor> {
    this.validateMangaId(mangaId);
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fs.isDirectoryExist(mangaDir))) await fs.mkdir(mangaDir);
    return new MangaAccessor(this.dir, mangaId);
  }

  async deleteManga(mangaId: string): Promise<void> {
    this.validateMangaId(mangaId);
    this.assureMangaExist(mangaId);
    await fs.rmdir(path.join(this.dir, mangaId), { recursive: true });
  }

  async getManga(mangaId: string): Promise<MangaAccessor> {
    this.validateMangaId(mangaId);
    this.assureMangaExist(mangaId);
    return new MangaAccessor(this.dir, mangaId);
  }

  private validateMangaId(mangaId: string): void {
    if (!LibraryAccessor.mangaIdValidator.validate(mangaId))
      throw new BadRequestError(`${mangaId} is not legal manga id`);
  }

  private async assureMangaExist(mangaId: string): Promise<void> {
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fs.isDirectoryExist(mangaDir)))
      throw new NotFoundError(`Manga:${mangaId} not found`);
  }
}
