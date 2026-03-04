import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

const QUEUE = 'reservation_confirmation';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: QUEUE,
        queueOptions: { durable: true },
        noAck: false,
      },
    },
  );

  await app.listen();
  console.log('Mailer microservice is listening on queue:', QUEUE);
}

void bootstrap();
