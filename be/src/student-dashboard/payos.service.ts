import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayOS } from '@payos/node';

type CreatePaymentLinkInput = {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

@Injectable()
export class PayosService {
  private readonly payos: PayOS;

  constructor() {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!clientId || !apiKey || !checksumKey) {
      throw new InternalServerErrorException(
        'PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY must be configured.',
      );
    }

    this.payos = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }

  async createPaymentLink(input: CreatePaymentLinkInput) {
    const response = await this.payos.paymentRequests.create({
      orderCode: input.orderCode,
      amount: input.amount,
      description: input.description,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      items: [
        {
          name: 'Phi gui xe HCMUT',
          quantity: 1,
          price: input.amount,
        },
      ],
    });

    return {
      orderCode: response.orderCode,
      paymentLinkId: response.paymentLinkId,
      checkoutUrl: response.checkoutUrl as string,
      qrCode: (response as any).qrCode as string | undefined,
    };
  }

  async verifyWebhook(webhook: Record<string, unknown>) {
    return this.payos.webhooks.verify(webhook as any);
  }

  async getPaymentLinkByOrderCode(orderCode: number) {
    return this.payos.paymentRequests.get(orderCode);
  }
}
