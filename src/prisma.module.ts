/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Optional nếu bạn muốn dùng ở mọi module mà không cần import thủ công
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}