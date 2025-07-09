import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TicketsService } from '../src/tickets/tickets.service';
import {
  parter,
  balcony,
  l_balcony,
  r_balcony,
  Statuses,
  ReservePeriodMs,
  getLastSeat,
  getFullListSeats,
  Sectors,
  getSectorTitle,
} from '../src/utils/constants';

describe('getSeats', () => {
  let app: INestApplication<App>;
  let service: TicketsService;
  const obj = {
    // sector: parter,
    // row: 1,
    // seat: 1,
    // status: Statuses.Reserved,
    // date: Date.now(),
    chat: 'chat1',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<TicketsService>(TicketsService);
    await app.init();
    await service.clear();
  });

  afterEach(async () => {
    await service.clear();
  });

  describe('зарезервировать несколько мест в одном ряду, запросить доступные билеты этого ряда', () => {
    [
      { sector: parter, row: 1 },
      { sector: balcony, row: 1 },
      { sector: l_balcony, row: 1 },
      { sector: r_balcony, row: 1 },
    ].forEach(({ sector, row }) => {
      it(`${sector}`, async () => {
        const divider = 5;
        const seatsForReserve = getFullListSeats(sector, row).filter(
          (el) => el % divider === 0,
        );
        for (const seat of seatsForReserve) {
          await service.reserve({
            ...obj,
            sector: sector as Sectors,
            row,
            seat,
          });
        }
        const result = await service.getSeats(sector, row);
        const arr = getFullListSeats(sector, row).filter(
          (el) => el % divider !== 0,
        );
        expect(result).toEqual(arr);
      });
    });
  });

  describe('зарезервировать несколько мест в одном ряду, после паузы доступны все места', () => {
    [
      { sector: parter, row: 1 },
      { sector: balcony, row: 1 },
      { sector: l_balcony, row: 1 },
      { sector: r_balcony, row: 1 },
    ].forEach(({ sector, row }) => {
      it(`${getSectorTitle(sector)}`, async () => {
        const divider = 5;
        const seatsForReserve = getFullListSeats(sector, row).filter(
          (el) => el % divider === 0,
        );
        for (const seat of seatsForReserve) {
          await service.reserve({
            ...obj,
            sector: sector as Sectors,
            row,
            seat,
          });
        }
        await new Promise((r) => setTimeout(r, ReservePeriodMs));
        const result = await service.getSeats(sector, row);
        const arr = getFullListSeats(sector, row);
        expect(result).toEqual(arr);
      });
    });
  });

  describe('купить несколько мест в одном ряду, запросить доступные билеты этого ряда', () => {
    [
      { sector: parter, row: 25 },
      { sector: balcony, row: 8 },
      { sector: l_balcony, row: 1 },
      { sector: r_balcony, row: 1 },
    ].forEach(({ sector, row }) => {
      it(`${getSectorTitle(sector)}`, async () => {
        const divider = 5;
        const seatsForReserve = getFullListSeats(sector, row).filter(
          (el) => el % divider === 0,
        );
        for (const seat of seatsForReserve) {
          await service.buy({
            ...obj,
            sector: sector as Sectors,
            row,
            seat,
          });
        }
        await new Promise((r) => setTimeout(r, ReservePeriodMs));
        const result = await service.getSeats(sector, row);
        const arr = getFullListSeats(sector, row).filter(
          (el) => el % divider !== 0,
        );
        expect(result).toEqual(arr);
      });
    });
  });

  describe('покупка первых и последних мест, после паузы доступны все места', () => {
    [
      { sector: parter, row: 1 },
      { sector: balcony, row: 1 },
      { sector: l_balcony, row: 1 },
      { sector: r_balcony, row: 1 },
    ].forEach(({ sector, row }) => {
      it(`${getSectorTitle(sector)}`, async () => {
        const seats = getFullListSeats(sector, row);
        const seatsForReserve = [seats[0], seats[seats.length - 1]];
        if (sector === parter) {
          seatsForReserve.push(seats[1]);
          seatsForReserve.push(seats[2]);
        }
        for (const seat of seatsForReserve) {
          await service.reserve({
            ...obj,
            sector: sector as Sectors,
            row,
            seat,
          });
        }
        const result = await service.getSeats(sector, row);
        console.log('result', result);
        console.log('seatsForReserve', seatsForReserve);
        const arr = getFullListSeats(sector, row).filter(
          (el: number) => !seatsForReserve.includes(el),
        );
        expect(result).toEqual(arr);
      });
    });
  });
});
