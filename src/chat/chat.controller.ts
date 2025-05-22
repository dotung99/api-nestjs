/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create-group')
  async createChatGroup(
    @Request() req: RequestWithUser,
    @Body() body: { adminId: string },
  ) {
    // Lấy userId từ token đã được xác thực
    const userId = req.user.userId;
    return this.chatService.createChatGroup(userId, body.adminId);
  }

  @Get('user')
  async getUserChats(@Request() req: RequestWithUser) {
    // Lấy userId từ token đã được xác thực
    const userId = req.user.userId;
    return this.chatService.getUserChats(userId);
  }

  @Get('admin/:adminId')
  async getChatWithAdmin(
    @Request() req: RequestWithUser,
    @Param('adminId') adminId: string,
  ) {
    // Lấy userId từ token đã được xác thực
    const userId = req.user.userId;
    return this.chatService.getChatWithAdmin(userId, adminId);
  }

  @Get('participants/:conversationId')
  async getParticipants(@Param('conversationId') conversationId: string) {
    return this.chatService.getParticipants(conversationId);
  }

  @Get('messages/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Post('create-message')
  async createMessage(
    @Body() body: { conversationId: string; senderId: string; text: string },
  ) {
    return this.chatService.createMessage(body);
  }
}
