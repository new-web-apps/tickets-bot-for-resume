import { Injectable, Inject } from '@nestjs/common';
import {
  Action,
  Command,
  Hears,
  Help,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { ConversationService } from './conversation/conversation.serviece';
import {
  balcony,
  getSectorTitle,
  l_balcony,
  parter,
  r_balcony,
  Sectors,
  texts,
} from './utils/constants';
import { chunk } from 'lodash';
import { TicketsService } from './tickets/tickets.service';
import { join } from 'path';
import { PreCheckoutQuery } from 'telegraf/typings/core/types/typegram';

@Update()
@Injectable()
export class AppService {
  constructor(
    @Inject()
    private conversationService: ConversationService,
    private ticketsService: TicketsService,
  ) {}

  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }

  @Start()
  async startCommand(ctx: Context) {
    const buttons = this.conversationService
      .sendSectors()
      .map((obj) => Markup.button.callback(obj[0], obj[1]));
    await ctx.reply(texts.selectSector, Markup.inlineKeyboard(buttons));
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.reply('👍');
  }

  @Action(
    new RegExp(
      `^(${parter}|${balcony}|${l_balcony}|${r_balcony})_([0-9]+)_([0-9]+)$`,
    ),
  )
  async reserveSeat(ctx: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sector: Sectors = parseInt(ctx.match[1] as string) as Sectors;
    const row: Sectors = parseInt(ctx.match[2] as string) as Sectors;
    const seat: Sectors = parseInt(ctx.match[3] as string) as Sectors;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ctxTyped: Context = ctx;
    console.log('ctxTyped', ctxTyped.callbackQuery?.message?.chat.id);
    const chatId = ctxTyped.callbackQuery?.message?.chat.id;
    if (!chatId) {
      throw new TypeError(`reserveSeat: Не удалось получить chatId ${ctx}`);
    }
    // зерезервировать
    await this.ticketsService.reserve({
      chat: chatId.toString(),
      sector: sector,
      row: row,
      seat: seat,
    });
    await this.conversationService.getReservedTickets(ctx, chatId);
  }

  @Action(
    new RegExp(`^(${parter}|${balcony}|${l_balcony}|${r_balcony})_([0-9]+)$`),
  )
  async sendSeats(ctx: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sector: Sectors = parseInt(ctx.match[1] as string) as Sectors;
    const row: Sectors = parseInt(ctx.match[2] as string) as Sectors;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ctxTyped: Context = ctx;
    const buttons = (await this.conversationService.sendSeats(sector, row)).map(
      (obj) => Markup.button.callback(obj[0], obj[1]),
    );
    const buttonsUpd = chunk(buttons, 5);
    await ctxTyped.reply(
      `${texts.selectSeats} (${getSectorTitle(sector)} ряд ${row})`,
      Markup.inlineKeyboard(buttonsUpd),
    );
  }

  @Action(new RegExp(`^(${parter}|${balcony}|${l_balcony}|${r_balcony})$`))
  async sendRows(ctx: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sector: Sectors = parseInt(ctx.match[1] as string) as Sectors;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ctxTyped: Context = ctx;
    const buttons = (await this.conversationService.sendRows(sector)).map(
      (obj) => Markup.button.callback(obj[0], obj[1]),
    );
    const buttonsUpd = chunk(buttons, 5);
    await ctxTyped.reply(
      `${texts.selectRow} (${getSectorTitle(sector)})`,
      Markup.inlineKeyboard(buttonsUpd),
    );
  }

  @Command(`hall`)
  async hall(ctx: Context) {
    try {
      await ctx.replyWithPhoto(
        {
          source: join(__dirname, 'images', 'hall.png'),
        },
        { caption: texts.hall },
      );
    } catch (e) {
      console.log('e', e);
    }
  }

  @Command(`reserved`)
  async showReserved(ctx: Context) {
    // получить chatId
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new TypeError('showReserved: emplty chatId');
    }
    await this.conversationService.getReservedTickets(ctx, chatId);
  }

  @Command(`purchased`)
  async showPurchased(ctx: Context) {
    // получить chatId
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new TypeError('showReserved: emplty chatId');
    }
    const reservedTicketList =
      await this.conversationService.getPurchasedTickets(chatId);
    // показать зарезервированные билеты пользователя
    ctx.reply(`${texts.purchasedTickets}\n${reservedTicketList}`);
  }

  @Action('buy')
  @Command(`buy`)
  async buyTickets(ctx: Context) {
    // получить chatId
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new TypeError('buy: emplty chatId');
    }
    // вызвать команду покупки зарезервированнх билетов
    // если успешно, то вывести списко купленных билетов (есть команда)
    // если неуспешно, то сообщение что билеты не удалось купить
    try {
      const result = await this.ticketsService.sendInvoiceWithReservedTickets(
        ctx,
        chatId,
      );
      console.log('result', result);
      // ctx.reply(result);
    } catch (e) {
      console.log(`buyTickets: ${e}`);
      ctx.reply('Произошла ошибка при покупке билетов');
    }
  }

  @Action('reset')
  @Command(`reset`)
  async resetTickets(ctx: Context) {
    // получить chatId
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new TypeError('resetTickets: emplty chatId');
    }
    try {
      const tickets = await this.ticketsService.getReservedTickets(chatId);
      for (const ticket of tickets) {
        await this.ticketsService.reset(ticket);
      }
      ctx.reply(texts.reset);
    } catch (e) {
      console.log(`buyTickets: ${e}`);
      ctx.reply('Произошла ошибка при покупке билетов');
    }
  }

  @On('pre_checkout_query')
  async preCheckoutQuery(ctx: Context) {
    console.log('on pre_checkout_query');
    try {
      await ctx.answerPreCheckoutQuery(true);
    } catch (e) {
      console.log('ошибка при подтверждении платежа', e);
      ctx.reply('Произошла ошибка при подтверждении платежа');
    }
    console.log('Намерение платежа подтверждено');
  }

  @On('successful_payment')
  // async preCheckoutQuery(query: PreCheckoutQuery) {
  async successfulPayment(ctx: Context) {
    console.log('successful_payment');
    const chatId = ctx.chat?.id;
    console.log('chatId', chatId);
    if (!chatId) {
      throw new TypeError('buy: emplty chatId');
    }
    try {
      const tickets = await this.ticketsService.successPayment(ctx, chatId);
      await ctx.replyWithPhoto(
        {
          source: join(__dirname, 'images', 'ticket.png'),
        },
        { caption: `${texts.purchasedTickets}:\n${tickets.join(`,\n`)}` },
      );
    } catch (e) {
      console.log('ошибка при подтверждении платежа', e);
    }
    console.log('Деньги были заплачены');
  }
}
