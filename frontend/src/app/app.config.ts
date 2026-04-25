import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'en-US' }
  ]
};
