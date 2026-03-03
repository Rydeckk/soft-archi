import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  number: string;
}
