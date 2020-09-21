import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum DownloadStatus {
  Waiting = 'waiting',
  Downloading = 'downloading',
  Paused = 'paused',
  Error = 'error',
}

@Entity()
export class DownloadDesc {
  @PrimaryColumn()
  id!: string;

  @Column()
  providerId!: string;

  @Column()
  sourceManga!: string;

  @Column({ default: DownloadStatus.Waiting })
  status!: string;
}
