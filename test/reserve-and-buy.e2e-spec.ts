import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TicketsService } from '../src/tickets/tickets.service';
import { parter, Statuses, ReservePeriodMs } from '../src/utils/constants';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let service: TicketsService;
  const obj = {
    sector: parter,
    row: 25,
    seat: 36,
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

  it('reserve ticket', async () => {
    await service.reserve(obj);
    const result = await service.getTicket(obj);
    expect(result).toEqual(expect.objectContaining(obj));
  });

  it('второй раз резервирование того же самого билета тем же пользователем', async () => {
    await new Promise((r) => setTimeout(r, ReservePeriodMs / 10));
    await service.reserve(obj);
    const result = await service.getTicket({
      ...obj,
      status: Statuses.Reserved,
    });
    expect(result).toEqual(expect.objectContaining(obj));
  });

  it('error while reserve same ticket', async () => {
    await expect(service.reserve({ ...obj, chat: 'chat2' })).rejects.toThrow(
      // TypeError,
      'reserve: alreagy reserved',
    );
  });

  it('successful reserve after pause', async () => {
    await new Promise((r) => setTimeout(r, ReservePeriodMs));
    await service.reserve({ ...obj, chat: 'chat2' });
    const result = await service.getTicket({
      ...obj,
      chat: 'chat2',
      status: Statuses.Reserved,
    });
    expect(result).toEqual(expect.objectContaining({ ...obj, chat: 'chat2' }));
  });

  it('buy', async () => {
    await service.buy({ ...obj, chat: 'chat2' });
    const result = await service.getTicket({
      ...obj,
      chat: 'chat2',
      status: Statuses.Purchased,
    });
    expect(result).toEqual(
      expect.objectContaining({
        ...obj,
        chat: 'chat2',
        status: Statuses.Purchased,
      }),
    );
  });

  it(`error reserve after buy`, async () => {
    await expect(service.reserve(obj)).rejects.toThrow(
      // TypeError,
      'reserve: alreagy buyed',
    );
  });

  it(`error reserve after buy`, async () => {
    await new Promise((r) => setTimeout(r, ReservePeriodMs));
    await expect(service.reserve(obj)).rejects.toThrow(
      // TypeError,
      'reserve: alreagy buyed',
    );
  });

  it('error buy after buy', async () => {
    await new Promise((r) => setTimeout(r, ReservePeriodMs));
    await expect(service.buy(obj)).rejects.toThrow(
      // TypeError,
      'reserve: alreagy buyed',
    );
  });

  it('сразу buy, без предварительного резервирования', async () => {
    await service.buy({ ...obj, seat: 35 });
    const result = await service.getTicket({
      ...obj,
      seat: 35,
      status: Statuses.Purchased,
    });
    expect(result).toEqual(
      expect.objectContaining({
        ...obj,
        seat: 35,
        status: Statuses.Purchased,
      }),
    );
  });
});
