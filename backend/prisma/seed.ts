import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ParkingCode, PrismaClient } from 'generated/prisma/client';
import { PARKING_CODE } from 'lib/enums/ParkingCode';
import { hash } from 'bcrypt';
import { USER_ROLE } from 'lib/enums/UserRole';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const main = async () => {
  await prisma.parking.createMany({
    data: Object.values(PARKING_CODE).flatMap((code) =>
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(
        (number) => ({
          code,
          number,
          hasElectricalTerminal: (
            [PARKING_CODE.A, PARKING_CODE.F] as ParkingCode[]
          ).includes(code),
        }),
      ),
    ),
  });

  const SECRETARY_EMAIL = 'secretary@gmail.com';

  const hashedPassword = await hash(SECRETARY_EMAIL, 10);

  await prisma.user.create({
    data: {
      name: 'Secretary',
      email: SECRETARY_EMAIL,
      password: hashedPassword,
      role: USER_ROLE.SECRETARY,
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
