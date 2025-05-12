/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateConversationDto & { participantIds?: string[] }) {
    const { participantIds, ...conversationData } = data;
    return this.prisma.conversation.create({
      data: {
        ...conversationData,
        participants: {
          create: participantIds?.map(userId => ({
            user: { connect: { id: userId } }
          })) || []
        }
      },
      include: { participants: true },
    });
  }

  findAll() {
    return this.prisma.conversation.findMany({
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: true,
      },
    });
  }

  async update(id: string, data: UpdateConversationDto) {
    await this.ensureExists(id);
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  private async ensureExists(id: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new NotFoundException(`Conversation ${id} not found`);
  }
}

