/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/* eslint-disable prettier/prettier */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
 async onModuleInit() {
    await this.$connect();
     }
}