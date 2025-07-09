import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { AppModule } from '../app.module';

describe('UsersService', () => {
  let service: TicketsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    service = moduleFixture.get<TicketsService>(TicketsService);
    await app.init();
    await service.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
