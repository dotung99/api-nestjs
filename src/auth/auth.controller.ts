/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { SignupDTO } from './dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('signup')
    signup(@Body() body: SignupDTO): Promise<any> {
        return this.authService.signup(body);
    }
    @Post('login')
    login(@Body() body: { email: string; password: string }): Promise<any> {
        return this.authService.login(body);
    }

    @Post('refresh')
    refreshToken(@Body() body: { refreshToken: string }): Promise<any> {
        return this.authService.refreshToken(body.refreshToken);
    }
}