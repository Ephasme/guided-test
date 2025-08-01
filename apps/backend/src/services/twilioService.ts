import { Twilio } from "twilio";

interface TwilioMessage {
  To: string;
  Body: string;
}

export class TwilioService {
  constructor(
    private twilioClient: Twilio,
    private messagingServiceSid: string
  ) {}

  private async sendTwilioMessage(message: TwilioMessage): Promise<void> {
    await this.twilioClient.messages.create({
      messagingServiceSid: this.messagingServiceSid,
      to: message.To,
      body: message.Body,
    });
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    const twilioMessage: TwilioMessage = {
      To: phoneNumber,
      Body: message,
    };

    await this.sendTwilioMessage(twilioMessage);
  }
}
