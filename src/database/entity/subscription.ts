import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryColumn()
  id!: string;

  @Column()
  providerId!: string;

  @Column()
  sourceManga!: string;

  @Column()
  isEnabled: boolean = true;
}
