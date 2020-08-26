import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import 'reflect-metadata';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  source!: string;

  @Column()
  sourceManga!: string;

  @Column()
  targetManga!: string;

  @Column()
  isEnabled: boolean = true;
}
