/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDTO } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ){}
    signup = async (userData: SignupDTO): Promise<any> => {
        const user = await this.prismaService.person.findUnique({
            where: {
                email: userData.email,
            },
        });
        if (user) {
            throw new HttpException({ message: 'User already exists' }, HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userData.password, 10);
        return this.prismaService.person.create({
            data: {
                updatedAt: new Date(),
                email: userData.email,
                name: userData.name,
                password: hashPassword,
            }
        })
    }

    login = async (data: { email: string, password: string }): Promise<any> => {
        const user = await this.prismaService.person.findUnique({
            where: {
                email: data.email,
            },
        });
        if (!user) {
            throw new HttpException({ message: 'User not found' }, HttpStatus.UNAUTHORIZED);
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new HttpException({ message: 'Password does not correct.' }, HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            email: user.email,
            id: user.id,
            name: user.name,
        }
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '7d',
        });
        return {
            token,
            refreshToken,
        }
    }
}
