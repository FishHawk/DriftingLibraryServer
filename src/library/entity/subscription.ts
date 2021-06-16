export interface Subscription {
  providerId: string;
  mangaId: string;
  state: 'downloading' | 'waiting' | 'error' | 'updated';
  message: string;
}
