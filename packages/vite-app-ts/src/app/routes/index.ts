import { lazier } from 'eth-hooks/helpers';

// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

export const YourToken = lazier(() => import('./your-token/YourToken'), 'YourToken');
export const Checkout = lazier(() => import('./checkout/Checkout'), 'Checkout');
export const Subgraph = lazier(() => import('./subgraph/Subgraph'), 'Subgraph');
export const Hints = lazier(() => import('./hints/Hints'), 'Hints');
