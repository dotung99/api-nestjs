/* eslint-disable prettier/prettier */
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
        const user = await this.prismaService.user.findUnique({
            where: {
                email: userData.email,
            },
        });
        if (user) {
            throw new HttpException({ message: 'User already exists' }, HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userData.password, 10);
        return this.prismaService.user.create({
            data: {
                updatedAt: new Date(),
                email: userData.email,
                name: userData.name,
                password: hashPassword,
            }
        })
    }

    login = async (data: { email: string, password: string }): Promise<any> => {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if (!user) {
            throw new HttpException({ message: 'User not found' }, HttpStatus.UNAUTHORIZED);
        }
        if (!user.password) {
            throw new HttpException({ message: 'Invalid user password' }, HttpStatus.UNAUTHORIZED);
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new HttpException({ message: 'Password does not correct.' }, HttpStatus.UNAUTHORIZED);
        }

        // Kiểm tra xem user có token cũ không
        const existingAccount = await this.prismaService.account.findFirst({
            where: {
                userId: user.id,
            },
        });

        // Nếu có token cũ, kiểm tra hết hạn
        if (existingAccount?.access_token) {
            try {
                const decodedToken = this.jwtService.verify(existingAccount.access_token, {
                    secret: process.env.JWT_SECRET,
                });
                // Nếu token còn hạn, trả về token cũ
                return {
                    token: existingAccount.access_token,
                    refreshToken: existingAccount.refresh_token,
                };
            } catch (error) {
                // Token hết hạn, tạo token mới
            }
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

        // Lưu token mới vào database
        await this.prismaService.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: 'local',
                    providerAccountId: user.id,
                },
            },
            update: {
                access_token: token,
                refresh_token: refreshToken,
                expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            },
            create: {
                userId: user.id,
                type: 'jwt',
                provider: 'local',
                providerAccountId: user.id,
                access_token: token,
                refresh_token: refreshToken,
                expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            },
        });

        return {
            token,
            refreshToken,
        }
    }

    refreshToken = async (refreshToken: string): Promise<any> => {
        try {
            const payload = await this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            });

            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.id,
                },
            });

            if (!user) {
                throw new HttpException({ message: 'User not found' }, HttpStatus.UNAUTHORIZED);
            }

            const newPayload = {
                email: user.email,
                id: user.id,
                name: user.name,
            };

            const newAccessToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '1h',
            });

            const newRefreshToken = this.jwtService.sign(newPayload, {
                secret: process.env.REFRESH_TOKEN_SECRET,
                expiresIn: '7d',
            });

            return {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new HttpException({ message: 'Invalid refresh token' }, HttpStatus.UNAUTHORIZED);
        }
    }
}
