import { Ticket } from 'src/entities/ticket.entity';
import {
  balcony,
  decimalPlaceNumber,
  getSectorTitle,
  parter,
  Sectors,
} from './constants';

export const labelsByTickets = (tickects: Ticket[]) => {
  return tickects.map((tickect: Ticket) => {
    let label = getSectorTitle(tickect.sector);
    if (([parter, balcony] as Sectors[]).includes(tickect.sector)) {
      label += ` ряд ${tickect.row}`;
    }
    label += ` место ${tickect.seat == decimalPlaceNumber ? '0.1' : tickect.seat}`;
    return label;
  });
};
