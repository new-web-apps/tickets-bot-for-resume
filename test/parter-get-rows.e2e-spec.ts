import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TicketsService } from '../src/tickets/tickets.service';
import {
  balcony,
  parter,
  getCountSeat,
  getLastSeat,
  CountRows,
  l_balcony,
  r_balcony,
} from '../src/utils/constants';

describe('getRows', () => {
  let app: INestApplication<App>;
  let service: TicketsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<TicketsService>(TicketsService);
    await app.init();
    await service.clear();
  });

  [
    { sector: parter, row: 25 },
    { sector: balcony, row: 8 },
    { sector: l_balcony, row: 1 },
    { sector: r_balcony, row: 1 },
  ].forEach(({ sector, row }) => {
    describe(sector, () => {
      it('reserve all row', async () => {
        for (const i of [...Array(getCountSeat(sector, row)).keys()].map(
          (i: number) => i + 1,
        )) {
          await service.reserve({
            sector,
            row,
            seat: i,
            chat: 'chat1',
          });
        }
      });

      it('reserve uncorrect ticket', async () => {
        await expect(
          service.reserve({
            sector,
            row: row,
            seat: getLastSeat(sector, row)! + 1,
            chat: 'chat1',
          }),
        ).rejects.toThrow('reserve: Uncorrect ticket');
      });

      it('no reserved row in list of row', async () => {
        const rows = await service.getRows(sector);
        expect(rows).toEqual(
          [...Array(CountRows[sector] - 1).keys()].map<number>(
            (i: number) => i + 1,
          ),
        );
      });
    });
  });
});
