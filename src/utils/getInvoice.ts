import { NewInvoiceParameters } from 'telegraf/typings/telegram-types';
import { PROVIDER_TOKEN } from './constants';

export const getInvoice = (
  id: string,
  price: number,
  ticketsLabels: string[],
) => {
  console.log('process.env.PROVIDER_TOKEN', PROVIDER_TOKEN);
  const invoice: NewInvoiceParameters = {
    title: 'Билеты на отчетный концерт',
    // photo_url:
    //   'https://image.freepik.com/free-vector/abstract-holographic-effect-background_1048-7861.jpg',
    description: 'ДГТУ зал',
    prices: ticketsLabels.map((label) => ({
      label,
      amount: price * 100,
    })),
    currency: 'RUB',
    payload: JSON.stringify(ticketsLabels.length),
    start_parameter: 'get_access',
    provider_token: process.env.PROVIDER_TOKEN || PROVIDER_TOKEN,
    need_email: true,
    send_email_to_provider: true,
  };
  return invoice;
};
