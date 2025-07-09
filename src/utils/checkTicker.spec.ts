import { TicketDTO } from '../DTO/ticket.dto';
import { checkTicket } from '../utils/checkTicker';
import { parter, Statuses } from './constants';

describe('checkTicket', () => {
  // Партер
  it('correct tickets', () => {
    const ticket: TicketDTO = {
      sector: parter,
      row: 25,
      seat: 1,
      status: Statuses.Reserved,
      date: 1746373002007,
      chat: 'chat1',
    };
    expect(checkTicket(ticket)).toBe(true);
    expect(checkTicket({ ...ticket, seat: 10 })).toBe(true);
    expect(checkTicket({ ...ticket, seat: 36 })).toBe(true);
    expect(checkTicket({ ...ticket, row: 1, seat: 0 })).toBe(true);
    expect(checkTicket({ ...ticket, row: 1, seat: 0.1 })).toBe(true);
  });
  it('uncorrect tickets', () => {
    const ticket: TicketDTO = {
      sector: parter,
      row: 25,
      seat: 0,
      status: Statuses.Reserved,
      date: 1746373002007,
      chat: 'chat1',
    };
    expect(checkTicket(ticket)).toBe(false);
    expect(checkTicket({ ...ticket, seat: 37 })).toBe(false);
    expect(checkTicket({ ...ticket, seat: 0.1 })).toBe(false);
  });
});
