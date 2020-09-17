import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DownloadChapterDesc {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  task!: string;

  @Column()
  chapter!: string;
}
