import { Sectors, Statuses } from '../utils/constants';

export interface TicketDTO {
  sector: Sectors;
  seat: number;
  row: number; // 0 - это отсутствие значения
  status?: Statuses;
  date?: number;
  chat?: string;
}
