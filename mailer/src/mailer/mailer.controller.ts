import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from './mailer.service';
import { ReservationConfirmationMessage } from './mailer.service';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @EventPattern('reservation_confirmation')
  async handleReservationConfirmation(
    @Payload() data: ReservationConfirmationMessage,
  ) {
    await this.mailerService.sendConfirmationEmail(data);
  }
}
