import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { mockDeep } from 'jest-mock-extended';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  const prismaMock = mockDeep<PrismaService>();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/reservations (GET)', () => {
    it('should return an array of reservations', () => {
      const result = [
        {
          id: 1,
          guestName: 'John Doe',
          start: new Date(),
          end: new Date(),
          createdAt: new Date(),
        },
      ];

      prismaMock.reservation.findMany.mockResolvedValueOnce(result);

      return request(app.getHttpServer() as unknown)
        .get('/reservations')
        .expect(200)
        .expect((res) => {
          const body = res.body as { guestName: string }[];
          expect(Array.isArray(body)).toBe(true);
          expect(body[0].guestName).toBe('John Doe');
        });
    });
  });

  describe('/reservations (POST)', () => {
    it('should create a reservation with valid data', () => {
      const createDto = {
        guestName: 'Jane Doe',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      };

      const result = {
        id: 1,
        guestName: createDto.guestName,
        start: new Date(createDto.start),
        end: new Date(createDto.end),
        createdAt: new Date(),
      };

      prismaMock.reservation.create.mockResolvedValueOnce(result);

      return request(app.getHttpServer() as unknown)
        .post('/reservations')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          const body = res.body as { guestName: string };
          expect(body.guestName).toBe(createDto.guestName);
        });
    });

    it('should reject invalid data (missing guestName)', () => {
      return request(app.getHttpServer() as unknown)
        .post('/reservations')
        .send({
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        })
        .expect(400); // Bad Request from ValidationPipe
    });
  });
});
