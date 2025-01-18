import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StellarAsset {
  code: 'EURMTL' | 'XLM';
  issuer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  static readonly EURMTL_ISSUER = 'GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V';
  
  private readonly STELLAR_ADDRESS_KEY = 'payment-stellar-address';
  private readonly CURRENCY_KEY = 'payment-currency';

  private readonly DEFAULT_ASSET: StellarAsset = {
    code: 'EURMTL',
    issuer: SettingsService.EURMTL_ISSUER
  };

  private stellarAddressSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.STELLAR_ADDRESS_KEY) || ''
  );

  private assetSubject = new BehaviorSubject<StellarAsset>(
    JSON.parse(localStorage.getItem(this.CURRENCY_KEY) || JSON.stringify(this.DEFAULT_ASSET))
  );

  getStellarAddress() {
    return this.stellarAddressSubject.asObservable();
  }

  setStellarAddress(address: string) {
    localStorage.setItem(this.STELLAR_ADDRESS_KEY, address);
    this.stellarAddressSubject.next(address);
  }

  getAsset() {
    return this.assetSubject.asObservable();
  }

  setAsset(asset: StellarAsset) {
    localStorage.setItem(this.CURRENCY_KEY, JSON.stringify(asset));
    this.assetSubject.next(asset);
  }
}
