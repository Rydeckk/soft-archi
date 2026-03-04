import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

enum ParkingCode {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

export class UpdateParkingDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsEnum(ParkingCode)
  code?: ParkingCode;

  @IsOptional()
  @IsBoolean()
  hasElectricalTerminal?: boolean;
}
