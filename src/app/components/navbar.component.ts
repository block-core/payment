import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav>
      <div class="logo">
        <img src="/icons/icon-512x512.png" alt="Payment Logo" />
      </div>
      <div class="links">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Payment</a
        >
        <a routerLink="/history" routerLinkActive="active">History</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </div>
      <div class="flex-spacer"></div>
      <button *ngIf="deferredPrompt" class="install-btn" (click)="installApp()">
        <i class="fas fa-download"></i>
        Install App
      </button>
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      align-items: center;
      padding: 1rem 2rem;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.9);
    }

    .logo {
      height: 36px;
      transition: transform 0.2s;

      @media (max-width: 600px) {
        display: none;
      }
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .logo img {
      height: 100%;
      border-radius: 8px;
    }

    .links {
      margin-left: 2rem;
      display: flex;
      gap: 0.5rem;

      @media (max-width: 600px) {
        margin-left: 0;
      }
    }

    .links a {
      color: #4b5563;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;
    }

    .links a:hover {
      background-color: #f3f4f6;
      color: #2B4E61;
    }

    .links a.active {
      background-color: #2B4E61;
      color: white;
    }

    .flex-spacer {
      flex: 1;
    }

    .install-button {
      padding: 0.5rem 1rem;
      background-color: #2B4E61;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .install-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(43, 78, 97, 0.15);
    }
  `,
})
export class NavbarComponent {
  deferredPrompt: any = null;

  constructor() {}

  async installApp() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // We no longer need the prompt
    this.deferredPrompt = null;
  }
}
