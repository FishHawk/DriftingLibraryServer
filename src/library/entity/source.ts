export interface Source {
  providerId: string;
  mangaId: string;
  shouldDeleteAfterUpdated: boolean;
  state: 'downloading' | 'waiting' | 'error' | 'updated';
  message?: string;
}
