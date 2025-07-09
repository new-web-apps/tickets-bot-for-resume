import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConversationService } from './conversation/conversation.serviece';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.sqlite',
      // process.env.NODE_ENV === 'production'
      //   ? 'database.sqlite'
      //   : 'test.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TelegrafModule.forRoot({
      token:
        process.env.TELEGRAM_BOT_TOKEN!
    }),
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConversationService],
})
export class AppModule {}
