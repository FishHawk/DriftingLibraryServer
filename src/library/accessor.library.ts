import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { StringValidator } from '../util/validator';

import * as Entity from './entity';
import { MangaAccessor } from './accessor.manga';
import { searchLibrary } from './search';
import { Result } from '../util/result';

export enum LibraryAccessorFailure {
  IllegalMangaId,
  MangaAlreadyExist,
  MangaNotFound,
}

type Failure1 = LibraryAccessorFailure.IllegalMangaId | LibraryAccessorFailure.MangaAlreadyExist;
type Failure2 = LibraryAccessorFailure.IllegalMangaId | LibraryAccessorFailure.MangaNotFound;

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

  async isMangaExist(mangaId: string): Promise<boolean> {
    if (!this.validateMangaId(mangaId)) return false;
    const mangaDir = path.join(this.dir, mangaId);
    return fsu.isDirectoryExist(mangaDir);
  }

  async createManga(mangaId: string): Promise<Result<undefined, Failure1>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(LibraryAccessorFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (await fsu.isDirectoryExist(mangaDir))
      return Result.failure(LibraryAccessorFailure.MangaAlreadyExist);

    await fs.mkdir(mangaDir);
    return Result.success(undefined);
  }

  async deleteManga(mangaId: string): Promise<Result<undefined, Failure2>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(LibraryAccessorFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fsu.isDirectoryExist(mangaDir)))
      return Result.failure(LibraryAccessorFailure.MangaNotFound);

    await fs.rmdir(mangaDir, { recursive: true });
    return Result.success(undefined);
  }

  async openManga(mangaId: string): Promise<Result<MangaAccessor, Failure2>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(LibraryAccessorFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (!await fsu.isDirectoryExist(mangaDir))
      return Result.failure(LibraryAccessorFailure.MangaNotFound);

    return Result.success(new MangaAccessor(this.dir, mangaId));
  }

  private validateMangaId(mangaId: string) {
    return LibraryAccessor.mangaIdValidator.validate(mangaId);
  }
}
