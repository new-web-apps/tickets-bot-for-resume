import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/users/users.service';
import { TicketsService } from '../src/tickets/tickets.service';
import { parter, Sectors } from '../src/utils/constants';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let service: TicketsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<UsersService>(UsersService);
    await app.init();
  });

  afterEach(async () => {
    await service.clear();
});

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer()).get('/users').expect(200).expect('[]');
  });

  it('test service', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });

  // Зарезервить билет, проверить, что он стал зарезервиноран

  // Партер

  it('reserve all row', async () => {
    const result = await service.reserve();
    for (const i of [...Array(36).keys().map<number>(i + 1)]){
      const result = await service.reserve({
        sector: parter,
        row: 25,
        seat: i,
        status: 
      });
      if (!result) {
        new Error(`Seat ${i} in row ${25} is already reserved`);
      }
    }
  });

  it('no reserved row in list of row', async () => {
    const rows = await service.getRows(parter);
    expect(rows).toEqual([...Array(35).keys().map<number>(i + 1)]);
  });

});
