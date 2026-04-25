import { CanActivateFn } from '@angular/router';

// Cart is accessible to everyone including guests (they use localStorage cart)
export const authGuard: CanActivateFn = () => true;
