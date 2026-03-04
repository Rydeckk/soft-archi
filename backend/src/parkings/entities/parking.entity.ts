import { ParkingCode } from 'lib/enums/ParkingCode';
import { Parking } from 'lib/types/api/Parking';

export class ParkingEntity implements Parking {
  id!: string;

  number!: string;

  code!: ParkingCode;

  hasElectricalTerminal!: boolean;

  constructor(partial: Partial<ParkingEntity>) {
    Object.assign(this, partial);
  }
}
