import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any;
  private installPromptSubject = new BehaviorSubject<boolean>(false);
  installPrompt$ = this.installPromptSubject.asObservable();

  constructor(private platform: Platform) {
    if (this.platform.isBrowser) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.installPromptSubject.next(true);
      });
    }
  }

  async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.installPromptSubject.next(false);
    return outcome === 'accepted';
  }
}
