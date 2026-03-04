import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ParkingCode, PrismaClient } from 'generated/prisma/client';
import { PARKING_CODE } from 'lib/enums/ParkingCode';
import { hash } from 'bcrypt';
import { USER_ROLE } from 'lib/enums/UserRole';
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const USERS = [
  {
    name: 'Alice Martin',
    email: 'alice.martin@company.com',
    role: USER_ROLE.EMPLOYEE,
  },
  {
    name: 'Bob Dupont',
    email: 'bob.dupont@company.com',
    role: USER_ROLE.EMPLOYEE,
  },
  {
    name: 'Claire Petit',
    email: 'claire.petit@company.com',
    role: USER_ROLE.EMPLOYEE,
  },
  {
    name: 'David Moreau',
    email: 'david.moreau@company.com',
    role: USER_ROLE.EMPLOYEE,
  },
  {
    name: 'Emma Bernard',
    email: 'emma.bernard@company.com',
    role: USER_ROLE.EMPLOYEE,
  },
  {
    name: 'Marc Leroy',
    email: 'marc.leroy@company.com',
    role: USER_ROLE.MANAGER,
  },
  {
    name: 'Sophie Girard',
    email: 'sophie.girard@company.com',
    role: USER_ROLE.SECRETARY,
  },
];

const main = async () => {
  // --- Parkings ---
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

  const allParkings = await prisma.parking.findMany();
  const spot = (code: string, number: string) => {
    const p = allParkings.find((p) => p.code === code && p.number === number);
    if (!p) throw new Error(`Parking ${code}${number} not found`);
    return p.id;
  };

  // --- Users ---
  const createdUsers: Record<string, string> = {}; // email -> id

  for (const u of USERS) {
    const hashed = await hash(u.email, 10);
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, password: hashed, role: u.role },
    });
    createdUsers[u.email] = created.id;
  }

  const alice = createdUsers['alice.martin@company.com'];
  const bob = createdUsers['bob.dupont@company.com'];
  const claire = createdUsers['claire.petit@company.com'];
  const david = createdUsers['david.moreau@company.com'];
  const emma = createdUsers['emma.bernard@company.com'];
  const marc = createdUsers['marc.leroy@company.com'];

  const today = new Date();

  const r1 = await prisma.reservation.create({
    data: {
      userId: alice,
      parkingId: spot('B', '03'),
      startDate: startOfDay(subDays(today, 10)),
      endDate: endOfDay(subDays(today, 8)),
    },
  });
  const r2 = await prisma.reservation.create({
    data: {
      userId: bob,
      parkingId: spot('C', '05'),
      startDate: startOfDay(subDays(today, 7)),
      endDate: endOfDay(subDays(today, 6)),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: claire,
      parkingId: spot('D', '02'),
      startDate: startOfDay(subDays(today, 5)),
      endDate: endOfDay(subDays(today, 4)),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: david,
      parkingId: spot('A', '07'),
      startDate: startOfDay(subDays(today, 3)),
      endDate: endOfDay(subDays(today, 2)),
    },
  });
  const r5 = await prisma.reservation.create({
    data: {
      userId: marc,
      parkingId: spot('F', '01'),
      startDate: startOfDay(subDays(today, 14)),
      endDate: endOfDay(subDays(today, 1)),
    },
  });

  // Actuelles (aujourd'hui)
  const r6 = await prisma.reservation.create({
    data: {
      userId: alice,
      parkingId: spot('B', '04'),
      startDate: startOfDay(today),
      endDate: endOfDay(addDays(today, 1)),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: bob,
      parkingId: spot('C', '08'),
      startDate: startOfDay(today),
      endDate: endOfDay(today),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: emma,
      parkingId: spot('E', '03'),
      startDate: startOfDay(today),
      endDate: endOfDay(addDays(today, 2)),
    },
  });

  // Futures
  await prisma.reservation.create({
    data: {
      userId: claire,
      parkingId: spot('D', '06'),
      startDate: startOfDay(addDays(today, 2)),
      endDate: endOfDay(addDays(today, 4)),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: david,
      parkingId: spot('A', '02'),
      startDate: startOfDay(addDays(today, 1)),
      endDate: endOfDay(addDays(today, 3)),
    },
  });
  await prisma.reservation.create({
    data: {
      userId: marc,
      parkingId: spot('F', '10'),
      startDate: startOfDay(addDays(today, 3)),
      endDate: endOfDay(addDays(today, 20)),
    },
  });

  // --- Check-ins (ReservationRegister) ---
  // Passées confirmées
  await prisma.reservationRegister.create({
    data: { userId: alice, reservationId: r1.id },
  });
  await prisma.reservationRegister.create({
    data: { userId: bob, reservationId: r2.id },
  });
  await prisma.reservationRegister.create({
    data: { userId: marc, reservationId: r5.id },
  });
  // r3 et r4 sans check-in → expirées

  // Actuelles confirmées
  await prisma.reservationRegister.create({
    data: { userId: alice, reservationId: r6.id },
  });
  // r7 (bob) et r8 (emma) sans check-in → en attente
};

main()
  .then(async () => {
    console.log('Seed completed successfully');
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
