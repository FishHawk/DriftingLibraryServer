import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DownloadChapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  task!: string;

  @Column()
  chapter!: string;
}
