/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [AuthModule, ConversationModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
