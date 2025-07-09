import { Sectors, Statuses } from '../utils/constants';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  sector: Sectors;

  @Column({ nullable: false })
  seat: number;

  @Column({ nullable: false })
  row: number; // 0 - это отсутствие значения

  @Column({ nullable: false })
  status: Statuses.Purchased | Statuses.Reserved | Statuses.Reset;

  @Column()
  date: number;

  @Column({ nullable: false })
  chat: string;
}
