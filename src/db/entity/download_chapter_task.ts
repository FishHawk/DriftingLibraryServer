import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DownloadChapterTask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  source!: string;

  @Column()
  sourceChapter!: string;

  @Column()
  targetManga!: string;

  @Column()
  targetCollection!: string;

  @Column()
  targetChapter!: string;

  @Column({ default: 0 })
  pageTotal!: number;

  @Column({ default: 0 })
  pageDownloaded!: number;

  @Column({ default: false })
  isCompleted!: boolean;
}
