/* eslint-disable prettier/prettier */
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsString()
  name?: string;
}
