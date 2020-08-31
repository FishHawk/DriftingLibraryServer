import { Entity, Column, PrimaryGeneratedColumn  } from 'typeorm';

export enum DownloadTaskStatus {
  Waiting = 'waiting',
  Downloading = 'downloading',
  Paused = 'paused',
  Error = 'error',
}

@Entity()
export class DownloadTask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  providerId!: string;

  @Column()
  sourceManga!: string;

  @Column()
  targetManga!: string;

  @Column({ default: DownloadTaskStatus.Waiting })
  status!: string;

  @Column()
  isCreatedBySubscription!: boolean;
}
