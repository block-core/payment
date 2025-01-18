import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PaymentRecord {
  id: string;
  amount: string;
  assetCode: string;
  destination: string;
  timestamp: number;
  paymentUrl: string;
  isPaid?: boolean;
  memo: string;
  transactionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  private readonly HISTORY_KEY = 'payment-history';
  private historySubject = new BehaviorSubject<PaymentRecord[]>(
    JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]')
  );

  getHistory() {
    return this.historySubject.asObservable();
  }

  addPayment(payment: PaymentRecord) {
    const current = this.historySubject.value;
    const updated = [payment, ...current];
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updated));
    this.historySubject.next(updated);
  }

  clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
    this.historySubject.next([]);
  }

  updatePaymentStatus(memo: string, isPaid: boolean, transactionId?: string) {
    const current = this.historySubject.value;
    const updated = current.map(payment => 
      payment.memo === memo ? { ...payment, isPaid, transactionId } : payment
    );
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updated));
    this.historySubject.next(updated);
  }
}
