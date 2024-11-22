import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { appConfig } from './app/app.config'; // Mantén esta línea si `appConfig` contiene otras configuraciones necesarias

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...appConfig.providers, // Si en `appConfig` tienes otros providers que deseas mantener
  ],
})
.catch((err) => console.error(err));
