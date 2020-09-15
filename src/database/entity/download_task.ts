import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum DownloadTaskStatus {
  Waiting = 'waiting',
  Downloading = 'downloading',
  Paused = 'paused',
  Error = 'error',
}

@Entity()
export class DownloadTask {
  @PrimaryColumn()
  id!: string;

  @Column()
  providerId!: string;

  @Column()
  sourceManga!: string;

  @Column({ default: DownloadTaskStatus.Waiting })
  status!: string;

  @Column()
  isCreatedBySubscription!: boolean;
}
