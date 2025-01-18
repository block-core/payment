import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component';
import { UpdateNotificationComponent } from './components/update-notification.component';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    UpdateNotificationComponent
  ],
  template: `
    <app-update-notification></app-update-notification>
    <app-navbar />
    <router-outlet />
  `,
  styles: []
})
export class AppComponent {
  pwaService = inject(PwaService);

  async installPwa() {
    await this.pwaService.installPwa();
  }
}
