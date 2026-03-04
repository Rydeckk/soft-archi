import { ParkingCode } from 'lib/enums/ParkingCode';

export type Parking = {
  number: string;
  id: string;
  code: ParkingCode;
  hasElectricalTerminal: boolean;
};
