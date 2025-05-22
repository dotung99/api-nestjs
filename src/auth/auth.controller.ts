/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Res } from '@nestjs/common';
import { SignupDTO } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    message: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('signup')
    signup(@Body() body: SignupDTO): Promise<any> {
        return this.authService.signup(body);
    }
    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) response: Response
    ): Promise<LoginResponse> {
        const result = await this.authService.login(body);
        
        // Set cookie cho access token
        response.cookie('access_token', result.token, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            domain: 'localhost',
            path: '/',
            maxAge: 3600000 // 1 hour
        });

        // Set cookie cho refresh token
        response.cookie('refresh_token', result.refreshToken, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            domain: 'localhost',
            path: '/',
            maxAge: 7 * 24 * 3600000 // 7 days
        });

        return {
            user: result.user as { id: string; email: string; name: string },
            message: 'Login successful'
        };
    }

    @Post('refresh')
    async refreshToken(
        @Body() body: { refreshToken: string },
        @Res({ passthrough: true }) response: Response
    ): Promise<LoginResponse> {
        const result = await this.authService.refreshToken(body.refreshToken);
        
        // Set cookie cho access token mới
        response.cookie('access_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: 'localhost',
            path: '/',
            maxAge: 3600000 // 1 hour
        });

        // Set cookie cho refresh token mới
        response.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: 'localhost',
            path: '/',
            maxAge: 7 * 24 * 3600000 // 7 days
        });

        return {
            user: result.user as { id: string; email: string; name: string },
            message: 'Token refreshed successfully'
        };
    }
}