import { Injectable, Logger } from '@nestjs/common';

export interface ReservationConfirmationMessage {
  reservationId: string;
  userEmail: string;
  userName: string;
  parkingCode: string;
  startDate: string;
  endDate: string;
  formattedStart: string;
  formattedEnd: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendConfirmationEmail(data: ReservationConfirmationMessage) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME ?? 'Parking App';

    if (!apiKey || !senderEmail) {
      this.logger.error(
        'Brevo credentials missing (BREVO_API_KEY, BREVO_SENDER_EMAIL)',
      );
      return;
    }

    const html = this.buildEmailHtml(data);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: senderEmail, name: data.userName }],
        subject: `Confirmation de réservation - Place ${data.parkingCode}`,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(
        `Failed to send email to ${senderEmail}: ${error}`,
      );
      return;
    }

    this.logger.log(
      `Confirmation email sent to ${data.userEmail} for reservation ${data.reservationId}`,
    );
  }

  private buildEmailHtml(data: ReservationConfirmationMessage): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1e293b; color: #fff; padding: 32px 40px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; color: #94a3b8; font-size: 14px; }
    .body { padding: 32px 40px; }
    .spot { display: inline-block; background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px 32px; font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 2px; margin: 16px 0; }
    .info-row { display: flex; gap: 8px; align-items: center; margin: 12px 0; color: #475569; font-size: 14px; }
    .label { font-weight: bold; color: #0f172a; min-width: 80px; }
    .footer { background: #f8fafc; padding: 20px 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .reminder { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0; font-size: 13px; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🅿️ Réservation confirmée</h1>
      <p>Parking de l'entreprise</p>
    </div>
    <div class="body">
      <p>Bonjour <strong>${data.userName}</strong>,</p>
      <p>Votre réservation de place de parking a bien été enregistrée.</p>

      <div style="text-align:center; margin: 24px 0;">
        <div class="spot">${data.parkingCode}</div>
      </div>

      <div class="info-row">
        <span class="label">Du :</span>
        <span>${data.formattedStart}</span>
      </div>
      <div class="info-row">
        <span class="label">Au :</span>
        <span>${data.formattedEnd}</span>
      </div>
      <div class="info-row">
        <span class="label">Référence :</span>
        <span style="font-family: monospace; font-size: 12px;">${data.reservationId}</span>
      </div>

      <div class="reminder">
        ⏰ <strong>Rappel :</strong> Vous devez effectuer votre check-in avant <strong>11h00</strong> le jour de votre arrivée en scannant le QR code sur place. Passé ce délai, votre place sera remise en disponibilité.
      </div>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
