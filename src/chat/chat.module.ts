/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatGateway } from './chat.gateway';

@Module({
    providers: [ChatService, PrismaService, ChatGateway],
    controllers: [ChatController],
    exports: [ChatService]
})
export class ChatModule {} 