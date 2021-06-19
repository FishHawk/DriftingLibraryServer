export interface Source {
  providerId: string;
  mangaId: string;
  keepAfterCompleted: boolean;
  state: 'downloading' | 'waiting' | 'error' | 'updated';
  message?: string;
}
