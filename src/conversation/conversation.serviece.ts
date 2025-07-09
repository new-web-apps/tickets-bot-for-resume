import { Injectable } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import {
  balcony,
  l_balcony,
  parter,
  r_balcony,
  Sectors,
  getSectorTitle,
  decimalPlaceNumber,
  texts,
} from '../utils/constants';
import { Context, Markup } from 'telegraf';
import { labelsByTickets } from 'src/utils/labelsByTickets';

@Injectable()
export class ConversationService {
  constructor(private readonly ticketsService: TicketsService) {}

  sendSectors() {
    console.log(JSON.stringify(parter));
    return [
      ['Партер', parter.toString()],
      ['Балкон', balcony.toString()],
      ['Левый балкон', `${l_balcony}_1`],
      ['Правый балкон', `${r_balcony}_1`],
    ];
  }

  async sendRows(sector: Sectors) {
    const rows = await this.ticketsService.getRows(sector);
    const buttons = rows.map((row) => [row.toString(), `${sector}_${row}`]);
    return buttons;
  }

  async sendSeats(sector: Sectors, row: number) {
    const rows = await this.ticketsService.getSeats(sector, row);
    const buttons = rows.map((seat) => [
      seat === decimalPlaceNumber ? '0.1' : seat.toString(),
      `${sector}_${row}_${seat}`,
    ]);
    return buttons;
  }

  async getReservedTickets(ctx: Context, chatId: number) {
    const tickets = await this.ticketsService.getReservedTickets(chatId);
    let reservedTicketList = '';
    if (!tickets.length) {
      reservedTicketList = texts.reservedTicketsNotFound;
    } else {
      reservedTicketList = tickets
        .map(
          (obj) =>
            `${getSectorTitle(obj.sector)} ряд ${obj.row} место ${obj.seat === decimalPlaceNumber ? '0.1' : obj.seat}`,
        )
        .join('\n');
    }
    await ctx.reply(
      `${texts.reservedTickets}\n${reservedTicketList}`,
      Markup.inlineKeyboard(
        tickets.length ? [Markup.button.callback('Купить', 'buy')] : [],
      ),
    );
  }

  async getPurchasedTickets(chatId: number) {
    const tickets = await this.ticketsService.getPurchasedTickets(chatId);
    if (!tickets.length) {
      return texts.purchasedTicketsNotFound;
    }
    return (
      labelsByTickets(tickets)
        // .map(
        //   (obj) =>
        //     `${getSectorTitle(obj.sector)} ряд ${obj.row} место ${obj.seat === decimalPlaceNumber ? '0.1' : obj.seat}`,
        // )
        .join('\n')
    );
  }
}
