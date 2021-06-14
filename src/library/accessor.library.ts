import path from 'path';

import * as fs from '../util/fs';
import { ok, fail, Result } from '../util/result';
import { validateString } from '../util/validator/validator';

import * as Entity from './entity';
import { MangaAccessor } from './accessor.manga';
import { searchLibrary } from './search';

export class LibraryAccessor {
  static readonly mangaIdValidator = validateString().isFilename();

  constructor(readonly dir: string) {}

  async search(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ): Promise<Entity.MangaOutline[]> {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  async ensureManga(
    mangaId: string
  ): Promise<Result<MangaAccessor, CreateFail>> {
    if (!this.validateMangaId(mangaId)) return fail(CreateFail.IllegalMangaId);
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fs.isDirectoryExist(mangaDir))) await fs.mkdir(mangaDir);
    const manga = new MangaAccessor(this.dir, mangaId);
    return ok(manga);
  }

  async deleteManga(mangaId: string) {
    if (!this.validateMangaId(mangaId)) return undefined;
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fs.isDirectoryExist(mangaDir))) return undefined;
    return fs.rmdir(mangaDir, { recursive: true }).then(() => mangaId);
  }

  async getManga(mangaId: string) {
    if (!this.validateMangaId(mangaId)) return undefined;
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fs.isDirectoryExist(mangaDir))) return undefined;
    return new MangaAccessor(this.dir, mangaId);
  }

  private validateMangaId(mangaId: string) {
    return LibraryAccessor.mangaIdValidator.validate(mangaId);
  }
}

/* fail */
export namespace LibraryAccessor {
  export enum CreateFail {
    IllegalMangaId,
  }
}
import CreateFail = LibraryAccessor.CreateFail;
