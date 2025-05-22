/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

interface CreateMessageData {
    conversationId: string;
    senderId: string;
    text: string;
}

@Injectable()
export class ChatService {
    constructor(private prismaService: PrismaService) {}

    async createChatGroup(userId: string, adminId: string) {
        console.log('userId', userId);
        console.log('adminId', adminId);
        // Kiểm tra userId và adminId không được giống nhau
        if (userId === adminId) {
            throw new HttpException(
                'Không thể tạo nhóm chat với chính mình',
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            // Kiểm tra đã có nhóm chat giữa user và admin chưa
            const existingChat = await this.prismaService.conversation.findFirst({
                where: {
                    isGroup: true,
                    participants: {
                        every: {
                            userId: { in: [userId, adminId] }
                        }
                    },
                },
                include: {
                    participants: true
                }
            });

            // Đảm bảo chỉ đúng 2 participant là user và admin
            if (existingChat && existingChat.participants.length === 2) {
                const ids = existingChat.participants.map(p => p.userId);
                if (ids.includes(userId) && ids.includes(adminId)) {
                    throw new HttpException(
                        'Bạn đã có nhóm chat với admin này',
                        HttpStatus.BAD_REQUEST
                    );
                }
            }

            // Tạo conversation mới
            const conversation = await this.prismaService.conversation.create({
                data: {
                    isGroup: true,
                    name: `Chat với Admin`,
                    participants: {
                        create: [
                            { userId: userId },
                            { userId: adminId }
                        ]
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            return conversation;
        } catch (error) {
            console.error('Error in createChatGroup:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Có lỗi xảy ra khi tạo nhóm chat',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getUserChats(userId: string) {
        return this.prismaService.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    select: {
                        id: true,
                        text: true,
                        createdAt: true,
                        senderId: true,
                        seen: true
                    }
                }
            },
            orderBy: [
                {
                    messages: {
                        _count: 'desc'
                    }
                },
                {
                    lastMessageAt: 'desc'
                }
            ]
        });
    }

    async getChatWithAdmin(userId: string, adminId: string) {
        return this.prismaService.conversation.findMany({
            where: {
                isGroup: true,
                participants: {
                    some: {
                        AND: [
                            { userId: userId },
                            { userId: adminId },
                            
                        ]
                    }
                }
            },
            select: {
                id: true,
                name: true,
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                },
            }
        });
    }

    async createMessage(data: CreateMessageData) {
        const message = await this.prismaService.message.create({
            data: {
                text: data.text,
                conversationId: data.conversationId,
                senderId: data.senderId,
                messageType: 'text'
            },
            include: {
                sender: true,
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        // Cập nhật thời gian tin nhắn cuối cùng của cuộc trò chuyện
        await this.prismaService.conversation.update({
            where: { id: data.conversationId },
            data: { lastMessageAt: new Date() }
        });

        return message;
    }

    async getParticipants(conversationId: string) {
        return this.prismaService.conversation.findUnique({
            where: { id: conversationId },
            select: {
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getMessages(conversationId: string) {
        return this.prismaService.message.findMany({
            where: { conversationId },
            select: {
                id: true,
                text: true,
                createdAt: true,
                senderId: true,
                seen: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async markMessageAsSeen(messageId: string) {
        return this.prismaService.message.update({
            where: { id: messageId },
            data: { seen: true }
        });
    }

    async markAllMessagesAsSeen(conversationId: string, userId: string) {
        return this.prismaService.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                seen: false
            },
            data: { seen: true }
        });
    }
} 