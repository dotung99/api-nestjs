/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

/* eslint-disable prettier/prettier */
export class SignupDTO {
    @IsEmail()
    email: string;
    @MinLength(6)
    password: string;
    @IsNotEmpty()
    name: string;
    @Matches(/^[0-9]{10}$/)
    phone: string;
    status: number;
}  