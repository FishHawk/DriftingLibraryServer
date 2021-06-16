import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';

import { BadRequestError, ConflictError } from './exception';
import { Downloader } from './downloader';

export class DownloadService {
  constructor(
    private readonly library: LibraryAccessor,
    private readonly providerManager: ProviderManager,
    private readonly downloader: Downloader
  ) {}
  // async createDownloadTask(
  //   providerId: string,
  //   sourceManga: string,
  //   targetManga: string,
  //   shouldCreateSubscription: boolean
  // ) {
  //   if (!this.library.validateMangaId(targetManga))
  //     throw new BadRequestError(`Manga:${targetManga} is not a valid manga id`);

  //   if (this.providerManager.getProvider(providerId) === undefined)
  //     throw new BadRequestError(`Provider:${providerId} not found`);

  //   if (await this.library.isMangaExist(targetManga)) {
  //     const manga = await this.library.getManga(targetManga);
  //     if (await manga.hasSubscription()) {
  //       throw new ConflictError(
  //         `Manga:${targetManga} subscription already exist`
  //       );
  //     } else {
  //       await manga.setSubscription({ providerId, mangaId: sourceManga });
  //       await manga.addSyncMark();
  //     }
  //   } else {
  //     await this.library.createManga(targetManga);
  //     const manga = await this.library.getManga(targetManga);
  //     await manga.setSubscription({ providerId, mangaId: sourceManga });
  //     await manga.addSyncMark();
  //   }

  //   this.downloader.start();
  // }
}
