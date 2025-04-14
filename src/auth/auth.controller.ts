/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { SignupDTO } from './dtos/auth.dto';
import { Person } from '@prisma/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('signup')
    signup(@Body() body: SignupDTO): Promise<Person> {
        return this.authService.signup(body);
    }
    @Post('login')
    login(@Body() body: { email: string; password: string }): Promise<any> {
        return this.authService.login(body);
    }
}