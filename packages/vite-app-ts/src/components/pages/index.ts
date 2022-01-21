import { lazier } from 'eth-hooks/helpers';

// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

export const YourCollectibles = lazier(() => import('./your-collectibles/YourCollectibles'), 'YourCollectibles');
export const Checkout = lazier(() => import('./checkout/Checkout'), 'Checkout');
export const Hints = lazier(() => import('./hints/Hints'), 'Hints');
