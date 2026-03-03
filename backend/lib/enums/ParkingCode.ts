import { ObjectValues } from './ObjectValues';

export const PARKING_CODE = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
} as const;

export type ParkingCode = ObjectValues<typeof PARKING_CODE>;
