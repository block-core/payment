import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHistoryService, PaymentRecord } from '../services/payment-history.service';
import { PaymentValidatorService } from '../services/payment-validator.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  template: `
    <div class="history-container">
      <h1>Payment History</h1>
      
      @if ((history$ | async)?.length) {
        <div class="history-list">
          @for (payment of history$ | async; track payment.id) {
            <div class="payment-card">
              <div class="payment-info">
                <div class="amount">{{ payment.amount }} {{ payment.assetCode }}</div>
                <div class="timestamp">{{ payment.timestamp | date:'medium' }}</div>
                <div class="destination">To: {{ payment.destination }}</div>
                @if (payment.transactionId) {
                  <div class="transaction-id">
                    Transaction: <a href="https://stellar.expert/explorer/public/tx/{{payment.transactionId}}" 
                    target="_blank">{{payment.transactionId}}</a>
                  </div>
                }
              </div>
              <div class="payment-actions">
                @if (payment.isPaid) {
                  <div class="payment-status">
                    <span class="status-icon success large">✓</span>
                  </div>
                } @else {
                  <qrcode [qrdata]="payment.paymentUrl" [width]="128" [errorCorrectionLevel]="'M'"></qrcode>
                  <div class="payment-status">
                    <button class="check-status-btn" (click)="checkPaymentStatus(payment)">
                      Check Status
                    </button>
                  </div>
                }
                <button (click)="copyPaymentUrl(payment.paymentUrl)">Copy Payment URL</button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          No payment history available
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .payment-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .payment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.1);
    }

    .amount {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .timestamp {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0.5rem 0;
    }

    .destination {
      font-family: monospace;
      word-break: break-all;
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .transaction-id {
      font-size: 0.875rem;
      margin-top: 0.75rem;
      
      a {
        color: #4f46e5;
        text-decoration: none;
        padding: 0.25rem 0.5rem;
        background: #f3f4f6;
        border-radius: 4px;
        transition: all 0.2s;
        
        &:hover {
          background: #e5e7eb;
          text-decoration: none;
        }
      }
    }

    .status-icon.success {
      color: #10b981;
      font-size: 2rem;
    }

    .status-icon.success.large {
      font-size: 4rem;
      margin: 1rem 0;
      animation: scaleIn 0.5s ease-in-out;
    }

    @keyframes scaleIn {
      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
      60% { transform: scale(1.2) rotate(10deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
  `]
})
export class HistoryComponent {
  private historyService = inject(PaymentHistoryService);
  private paymentValidator = inject(PaymentValidatorService);
  private clipboard = inject(Clipboard);
  
  history$ = this.historyService.getHistory();

  copyPaymentUrl(url: string) {
    this.clipboard.copy(url);
  }

  checkPaymentStatus(payment: PaymentRecord) {
    this.paymentValidator.startValidation({
      memo: payment.memo,
      expectedAmount: payment.amount,
      assetCode: payment.assetCode,
      destination: payment.destination
    });

    this.paymentValidator.validationStatus$.subscribe(status => {
      if (status?.isPaid) {
        this.historyService.updatePaymentStatus(payment.memo, true, status.transactionId);
      }
    });
  }
}
