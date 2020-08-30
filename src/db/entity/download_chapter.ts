import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DownloadChapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  task!: number;

  @Column()
  chapter!: string;
}
