import { Injectable } from '@angular/core';
import { StellarPaymentParams } from '../models/stellar.model';

@Injectable({
    providedIn: 'root'
})
export class QrCodeService {
    generateStellarPaymentUrl(params: StellarPaymentParams): string {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });

        return `web+stellar:pay?${queryParams.toString()}`;
    }
}
