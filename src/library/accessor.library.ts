import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { StringValidator } from '../util/validator';

import * as Entity from './entity';
import { AccessorManga } from './accessor.manga';
import { searchLibrary } from './search';
import { Result } from '../util/result';

export enum AccessorLibraryFailure {
  IllegalMangaId,
  MangaAlreadyExist,
  MangaNotFound,
}

type Failure1 = AccessorLibraryFailure.IllegalMangaId | AccessorLibraryFailure.MangaAlreadyExist;
type Failure2 = AccessorLibraryFailure.IllegalMangaId | AccessorLibraryFailure.MangaNotFound;

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

  async createManga(mangaId: string): Promise<Result<undefined, Failure1>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(AccessorLibraryFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (await fsu.isDirectoryExist(mangaDir))
      return Result.failure(AccessorLibraryFailure.MangaAlreadyExist);

    await fs.mkdir(mangaDir);
    return Result.success(undefined);
  }

  async deleteManga(mangaId: string): Promise<Result<undefined, Failure2>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(AccessorLibraryFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (!(await fsu.isDirectoryExist(mangaDir)))
      return Result.failure(AccessorLibraryFailure.MangaNotFound);

    await fs.rmdir(mangaDir, { recursive: true });
    return Result.success(undefined);
  }

  async openManga(mangaId: string): Promise<Result<AccessorManga, Failure2>> {
    if (!this.validateMangaId(mangaId))
      return Result.failure(AccessorLibraryFailure.IllegalMangaId);

    const mangaDir = path.join(this.dir, mangaId);
    if (!await fsu.isDirectoryExist(mangaDir))
      return Result.failure(AccessorLibraryFailure.MangaNotFound);

    return Result.success(new AccessorManga(this.dir, mangaId));
  }

  private validateMangaId(mangaId: string) {
    return AccessorLibrary.mangaIdValidator.validate(mangaId);
  }
}
