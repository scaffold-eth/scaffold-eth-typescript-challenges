import { lazier } from 'eth-hooks/helpers';

export const Checkout = lazier(() => import('./checkout/Checkout'), 'Checkout');
export const Hints = lazier(() => import('./hints/Hints'), 'Hints');
