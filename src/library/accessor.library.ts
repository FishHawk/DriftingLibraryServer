import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { ok, fail, Result } from '../util/result';
import { StringValidator } from '../util/validator';

import * as Entity from './entity';
import { MangaAccessor } from './accessor.manga';
import { searchLibrary } from './search';

export class LibraryAccessor {
  static readonly mangaIdValidator = new StringValidator().isFilename();

  constructor(readonly dir: string) {}

  async search(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ): Promise<Entity.MangaOutline[]> {
    return searchLibrary(this.dir, lastTime, limit, keywords);
  }

  async createManga(mangaId: string): Promise<Result<void, CreateFail>> {
    if (!this.validateMangaId(mangaId)) return fail(CreateFail.IllegalMangaId);
    const mangaDir = path.join(this.dir, mangaId);
    if (await fsu.isDirectoryExist(mangaDir)) return fail(CreateFail.MangaAlreadyExist);
    return fs.mkdir(mangaDir).then(() => ok());
  }

  async deleteManga(mangaId: string): Promise<Result<void, AccessFail>> {
    if (!this.validateMangaId(mangaId)) return fail(AccessFail.IllegalMangaId);
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fsu.isDirectoryExist(mangaDir))) return fail(AccessFail.MangaNotFound);
    return fs.rmdir(mangaDir, { recursive: true }).then(() => ok());
  }

  async openManga(mangaId: string): Promise<Result<MangaAccessor, AccessFail>> {
    if (!this.validateMangaId(mangaId)) return fail(AccessFail.IllegalMangaId);
    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fsu.isDirectoryExist(mangaDir))) return fail(AccessFail.MangaNotFound);
    return ok(new MangaAccessor(this.dir, mangaId));
  }

  private validateMangaId(mangaId: string) {
    return LibraryAccessor.mangaIdValidator.validate(mangaId);
  }
}

/* fail */
export namespace LibraryAccessor {
  export enum AccessFail {
    IllegalMangaId,
    MangaNotFound,
  }

  export enum CreateFail {
    IllegalMangaId,
    MangaAlreadyExist,
  }
}
import AccessFail = LibraryAccessor.AccessFail;
import CreateFail = LibraryAccessor.CreateFail;
