import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, MoreThan, Repository, UpdateResult } from 'typeorm';
import { TicketDTO } from '../DTO/ticket.dto';
import { Ticket } from '../entities/ticket.entity';
import { checkTicket } from '../utils/checkTicker';
import {
  CountRows,
  Sectors,
  Statuses,
  getCountSeat,
  ReservePeriodMs,
  getFullListRows,
  PARTER,
  parter,
  balcony,
  getFullListSeats,
  ticketPrice,
} from '../utils/constants';
import { Context } from 'vm';
import { getInvoice } from '../utils/getInvoice';
import { labelsByTickets } from 'src/utils/labelsByTickets';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find();
  }

  findOne(id: number): Promise<Ticket | null> {
    return this.ticketsRepository.findOneBy({ id });
  }

  create(ticket: Ticket): Promise<Ticket> {
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    await this.ticketsRepository.delete(id);
  }

  async clear(): Promise<void> {
    await this.ticketsRepository.clear();
  }

  async getTicket(ticket: Partial<TicketDTO>): Promise<Ticket | null> {
    console.log('getTicket');
    let ticketInDb: Ticket | null = null;
    try {
      ticketInDb = await this.ticketsRepository.findOne({
        where: [ticket],
      });
    } catch (e) {
      throw new TypeError(`getTicket: ${JSON.stringify(ticket)}, ${e}`);
    }
    console.log('ticketInDb', ticketInDb);
    return ticketInDb;
  }

  async createTicket(ticket: TicketDTO): Promise<InsertResult> {
    console.log('createTicket');
    const ticketForDb = this.ticketsRepository.create({
      ...ticket,
      date: Date.now(),
    });
    let result: InsertResult | null = null;
    try {
      result = await this.ticketsRepository.insert(ticketForDb);
    } catch (e) {
      throw new TypeError(`createTicket: ${JSON.stringify(ticket)}, ${e}`);
    }
    console.log('result', result);
    return result;
  }

  async updateTicket(ticket: TicketDTO): Promise<UpdateResult> {
    console.log('updateTicket');
    return await this.ticketsRepository.update(
      {
        sector: ticket.sector,
        row: ticket.row,
        seat: ticket.seat,
      },
      {
        chat: ticket.chat,
        status: ticket.status,
        date: Date.now(),
      },
    );
  }

  async reserve(ticket: TicketDTO): Promise<Ticket | UpdateResult> {
    if (!checkTicket(ticket)) {
      throw new TypeError(
        `reserve: Uncorrect ticket ${JSON.stringify(ticket)}`,
      );
    }
    // проверка что уже есть запись билета в бд
    const ticketInDb = await this.getTicket({
      sector: ticket.sector,
      row: ticket.row,
      seat: ticket.seat,
    });
    if (ticketInDb) {
      if (ticketInDb.status == Statuses.Purchased) {
        throw new TypeError(`reserve: alreagy buyed ${ticket}`);
      }
      console.log(
        'ticketInDb.date ',
        ticketInDb.date,
        'Date.now() ',
        Date.now(),
      );
      if (
        ticketInDb.date + ReservePeriodMs >= Date.now() &&
        ticketInDb.chat !== ticket.chat
      ) {
        throw new TypeError(
          `reserve: alreagy reserved ${JSON.stringify(ticket)}`,
        );
      }
      return this.updateTicket({ ...ticket, status: Statuses.Reserved });
    } else {
      return this.createTicket({ ...ticket, status: Statuses.Reserved });
    }
  }

  async reset(ticket: TicketDTO): Promise<null | UpdateResult> {
    if (!checkTicket(ticket)) {
      throw new TypeError(
        `reserve: Uncorrect ticket ${JSON.stringify(ticket)}`,
      );
    }
    // проверка что уже есть запись билета в бд
    const ticketInDb = await this.getTicket({
      sector: ticket.sector,
      row: ticket.row,
      seat: ticket.seat,
    });
    if (ticketInDb) {
      if (ticketInDb.status == Statuses.Purchased) {
        throw new TypeError(`reserve: alreagy buyed ${ticket}`);
      }
      console.log(
        'ticketInDb.date ',
        ticketInDb.date,
        'Date.now() ',
        Date.now(),
      );
      if (
        ticketInDb.date + ReservePeriodMs >= Date.now() &&
        ticketInDb.chat !== ticket.chat
      ) {
        // уже другой пользователь зарезервировал, ничего не надо менять в бд
        return null;
      }
      return this.updateTicket({ ...ticket, status: Statuses.Reset });
    }
    return null;
  }

  async buy(ticket: TicketDTO): Promise<Ticket | UpdateResult> {
    if (!checkTicket(ticket)) {
      throw new TypeError(
        `reserve: Uncorrect ticket ${JSON.stringify(ticket)}`,
      );
    }
    // проверка что уже есть запись билета в бд
    const ticketInDb = await this.getTicket({
      sector: ticket.sector,
      row: ticket.row,
      seat: ticket.seat,
    });
    if (ticketInDb) {
      if (ticketInDb.status == Statuses.Purchased) {
        throw new TypeError(`reserve: alreagy buyed ${ticket}`);
      }
      console.log(
        'ticketInDb.date ',
        ticketInDb.date,
        'Date.now() ',
        Date.now(),
      );
      if (
        ticketInDb.date + ReservePeriodMs >= Date.now() &&
        ticketInDb.chat !== ticket.chat
      ) {
        throw new TypeError(
          `reserve: alreagy reserved ${JSON.stringify(ticket)}`,
        );
      }
      return this.updateTicket({ ...ticket, status: Statuses.Purchased });
    } else {
      return this.createTicket({ ...ticket, status: Statuses.Purchased });
    }
  }

  // сейчас только для parter, balcony
  async getRows(sector: Sectors): Promise<number[]> {
    const tickets = await this.ticketsRepository.find({
      where: [
        {
          sector,
          status: Statuses.Purchased,
        },
        {
          sector,
          status: Statuses.Reserved,
          date: MoreThan(Date.now() - ReservePeriodMs),
        },
      ],
    });
    const rows: number[] = [];
    for (const row of getFullListRows(sector)) {
      const notFreeCount = tickets.filter(
        (el: Ticket) => el.row === row,
      ).length;
      const allCount = getCountSeat(sector, row);
      if (allCount > notFreeCount) rows.push(row);
    }
    return rows;
  }

  async getSeats(sector: Sectors, row: number): Promise<number[]> {
    // получить список билетов ряда
    // запросить в бд все купленные и зарезервированные билеты
    // из общего списка убрать unavailable seats
    const notFreeTickets = await this.ticketsRepository.find({
      where: [
        {
          sector,
          row,
          status: Statuses.Purchased,
        },
        {
          sector,
          row,
          status: Statuses.Reserved,
          date: MoreThan(Date.now() - ReservePeriodMs),
        },
      ],
    });
    const notFreeSeats: number[] = notFreeTickets.map((el) => el.seat);
    console.log('notFreeSeats', notFreeSeats);
    const seats = getFullListSeats(sector, row);
    return seats.filter((el) => !notFreeSeats.includes(el));
  }

  async getReservedTickets(chatId: number): Promise<Ticket[]> {
    const tickets = await this.ticketsRepository.find({
      where: [
        {
          chat: chatId.toString(),
          status: Statuses.Reserved,
          date: MoreThan(Date.now() - ReservePeriodMs),
        },
      ],
    });
    return tickets;
  }

  async getPurchasedTickets(chatId: number): Promise<Ticket[]> {
    const tickets = await this.ticketsRepository.find({
      where: [
        {
          chat: chatId.toString(),
          status: Statuses.Purchased,
        },
      ],
    });
    return tickets;
  }

  async sendInvoiceWithReservedTickets(
    ctx: Context,
    chatId: number,
  ): Promise<string> {
    const tickets = await this.getReservedTickets(chatId);
    if (!tickets.length) {
      return 'Не найдено выбранных билетов';
    }
    // метод покупки
    const labels = labelsByTickets(tickets);
    try {
      // console.log('getInvoice', getInvoice(chatId.toString(), 2000, labels));

      await ctx.sendInvoice(
        chatId.toString(),
        getInvoice(chatId.toString(), ticketPrice, labels),
      );
    } catch (e) {
      console.log(`buyReservedTickets: запрос на платеж ${e}`);
    }

    return '';
  }

  async successPayment(ctx: Context, chatId: number) {
    // получить инфоррмацию о билетах из платежа
    const transactionCode: string = ctx.update.message.successful_payment
      .provider_payment_charge_id as string;
    console.log('transactionCode', transactionCode);

    // check код

    const infoStr: string = ctx.update.message.successful_payment
      .invoice_payload as string;
    // ctx.update.message.successful_payment as TelegramSuccessfulPayment;
    const info = JSON.parse(infoStr) as number;

    console.log('info', info);

    const ticketsFromDb: Ticket[] = await this.getReservedTickets(chatId);

    if (info !== ticketsFromDb.length) {
      throw new TypeError(
        `successPayment: info.length !== ticketsFromDb.length, info ${JSON.stringify(info)}, ticketsFromDb ${JSON.stringify(ticketsFromDb)}`,
      );
    }

    for (const ticket of ticketsFromDb) {
      await this.buy({ ...ticket, chat: chatId.toString() });
    }
    return labelsByTickets(ticketsFromDb);
  }
}
