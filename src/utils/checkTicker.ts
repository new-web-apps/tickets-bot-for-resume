import { TicketDTO } from '../DTO/ticket.dto';
import {
  balcony,
  getLastSeat,
  l_balcony,
  parter,
  r_balcony,
  decimalPlaceNumber,
} from './constants';

export const checkTicket = (ticket: TicketDTO) => {
  if (ticket.sector == parter) {
    if (ticket.row < 1 || ticket.row > 25) return false;
    const lastSeat = getLastSeat(ticket.sector, ticket.row);
    if (
      lastSeat &&
      ((ticket.row > 5 && ticket.seat > lastSeat) ||
        (ticket.row <= 5 &&
          ticket.seat > lastSeat &&
          ticket.seat !== decimalPlaceNumber))
    )
      return false;
    if (ticket.seat === 0 && ticket.row <= 7) return true;
    if (ticket.seat === decimalPlaceNumber && ticket.row <= 5) return true;
    if (ticket.seat < 1) return false;
  } else if (ticket.sector === balcony) {
    if (ticket.row < 1 || ticket.row > 8) return false;
    const lastSeat = getLastSeat(ticket.sector, ticket.row);
    if (lastSeat && ticket.seat > lastSeat) return false;
  } else if (ticket.sector === l_balcony || ticket.sector === r_balcony) {
    if (ticket.row !== 1) return false;
    if (ticket.seat < 1 || ticket.seat > 33) return false;
  } else return false;
  return true;
};
