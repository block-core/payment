import { Component, computed, effect, inject, signal, HostListener } from '@angular/core';
import { SettingsService, StellarAsset } from '../services/settings.service';
import { QrCodeService } from '../services/qrcode.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Clipboard } from '@angular/cdk/clipboard';
import { PaymentHistoryService } from '../services/payment-history.service';
import { PaymentValidatorService } from '../services/payment-validator.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [QRCodeComponent],
  template: `
    <div class="payment-container">
      <div class="display">{{ displayValue() }} {{ currencySymbol() }}</div>

      @if (!showQrCode()) {
        <div class="numpad">
          @for(num of numbers; track num) {
            <button (click)="addNumber(num)">{{ num }}</button>
          }
          <button (click)="addNumber('00')">00</button>
          <button (click)="clear()">C</button>
          <button class="pay-button" [disabled]="!canPay()" (click)="pay()">
            Pay
          </button>
        </div>
      } @else {
        <div class="qr-container">
          @if (paymentStatus() !== 'paid') {
            <qrcode
              [qrdata]="qrCodeValue()"
              [width]="256"
              [errorCorrectionLevel]="'M'"
            ></qrcode>
          } @else {
            <div class="success-animation">
              <span class="status-icon success">✓</span>
            </div>
          }
          
          <div class="payment-status" [class]="paymentStatus()">
            @if (paymentStatus() === 'pending') {
              Waiting for payment...
            } @else if (paymentStatus() === 'paid') {
              Payment confirmed! ✓
            }
          </div>
          <div class="qr-actions">
            <button (click)="copyToClipboard()">Copy Payment Request</button>
            <button (click)="closeQrCode()">New Payment</button>
          </div>
          <div class="qr-text">{{ qrCodeValue() }}</div>
        </div>
      }

      @if (false) {
        <button class="debug-btn" (click)="simulatePaymentSuccess()">
          Debug: Simulate Payment Success
        </button>
      }
    </div>
  `,
  styles: `
    .payment-container {
      padding: 2rem 0 2rem 0;
      max-width: 400px;
      margin: 0 auto;
    }

    .display {
      background-color: white;
      padding: 1.25rem 1.5rem;
      height: 5rem;          /* Added fixed height */
      font-size: min(2.5rem, calc(400px / var(--length, 12))); /* Reduced from 3.5rem to 2.5rem and 600px to 400px */
      text-align: right;
      border-radius: 16px;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      font-weight: 600;
      color: #2c3e50;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;
      display: flex;         /* Added flex display */
      align-items: center;   /* Center vertically */
      justify-content: flex-end; /* Align text to the right */
    }

    .display:hover {
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1);
    }

    .numpad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    button {
      padding: 1.5rem;
      font-size: 1.5rem;
      border: none;
      border-radius: 12px;
      background-color: white;
      color: #2c3e50;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    button:active {
      background-color: #e0e0e0;
    }

    button.pay-button {
      background-color: #2B4E61;
      color: white;
      grid-column: span 3;
      font-weight: 600;
    }

    button.pay-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .qr-container {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    .qr-container:hover {
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1);
    }

    .qr-text {
      font-size: 0.75rem;
      color: #666;
      margin: 1rem 0;
      word-break: break-all;
      padding: 0 1rem;
    }

    .qr-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .qr-actions button {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      min-width: 120px;
      border-radius: 8px;
      background-color: white;
    }

    .qr-actions button:last-child {
      background-color: #2B4E61;
      color: white;
    }

    .payment-status {
      margin: 1.5rem 0;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .payment-status.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .payment-status.paid {
      background: #ecfdf5;
      color: #065f46;
    }

    .debug-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #ff9800;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .debug-btn:hover {
      background-color: #f57c00;
    }

    .success-animation {
      height: 256px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .status-icon.success {
        font-size: 8rem;
        color: #10b981;
        animation: scaleIn 0.5s ease-in-out;
      }
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0) rotate(-45deg);
        opacity: 0;
      }
      60% {
        transform: scale(1.2) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0);
        opacity: 1;
      }
    }
  `
})
export class HomeComponent {
  private settingsService = inject(SettingsService);
  private qrCodeService = inject(QrCodeService);
  private clipboard = inject(Clipboard);
  private historyService = inject(PaymentHistoryService);
  private validatorService = inject(PaymentValidatorService);

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  input = signal('');
  showQrCode = signal(false);
  qrCodeValue = signal('');
  stellarAddress = signal('');
  asset = signal<StellarAsset>({ 
    code: 'EURMTL', 
    issuer: SettingsService.EURMTL_ISSUER 
  });
  paymentStatus = signal<'pending' | 'paid' | null>(null);

  displayValue = computed(() => {
    const value = this.input() === '' ? 0 : parseFloat(this.input()) / 100;
    const displayText = `${value.toFixed(2)} ${this.asset().code}`;
    // Only start scaling when text is longer than 12 characters
    document.documentElement.style.setProperty('--length', Math.max(12, displayText.length).toString());
    return value.toFixed(2);
  });

  currencySymbol = computed(() => {
    return this.asset().code;
  });

  canPay = computed(() => {
    return parseFloat(this.input()) > 0;
  });

  constructor() {
    effect(() => {
      this.settingsService.getAsset().subscribe(asset => {
        this.asset.set(asset);
      });

      this.settingsService.getStellarAddress().subscribe(address => {
        this.stellarAddress.set(address);
      });

      this.validatorService.validationStatus$.subscribe(status => {
        if (status?.isPaid) {
          this.paymentStatus.set('paid');
          this.historyService.updatePaymentStatus(status.memo, true);
        } else if (status) {
          this.paymentStatus.set('pending');
        } else {
          this.paymentStatus.set(null);
        }
      });
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Only handle keyboard events when QR code is not shown
    if (this.showQrCode()) {
      return;
    }

    // Prevent default behavior for numeric keys to avoid double input
    if (/^\d$/.test(event.key) || event.key === 'Enter') {
      event.preventDefault();
    }

    if (/^\d$/.test(event.key)) {
      this.addNumber(event.key);
    } else if (event.key === 'Enter') {
      if (this.canPay()) {
        this.pay();
      }
    } else if (event.key === 'Escape' || event.key === 'Delete' || event.key === 'Backspace') {
      this.clear();
    }
  }

  addNumber(num: string) {
    if (this.input().length < 10) {
      this.input.set(this.input() + num);
    }
  }

  clear() {
    this.input.set('');
  }

  async pay() {
    if (this.canPay()) {
      const memo = `Payment_${Date.now()}`;
      const paymentParams: any = {
        destination: this.stellarAddress(),
        amount: this.displayValue(),
        asset_code: this.asset().code,
        asset_issuer: this.asset().code === 'XLM' ? undefined : this.asset().issuer,
        memo,
        memo_type: 'MEMO_TEXT' as const,
      };

      const paymentUrl = this.qrCodeService.generateStellarPaymentUrl(paymentParams);
      this.qrCodeValue.set(paymentUrl);
      
      // Save to history
      this.historyService.addPayment({
        id: Date.now().toString(),
        amount: this.displayValue(),
        assetCode: this.asset().code,
        destination: this.stellarAddress(),
        timestamp: Date.now(),
        paymentUrl,
        memo,
        isPaid: false
      });

      // Start payment validation
      this.validatorService.startValidation({
        memo,
        expectedAmount: this.displayValue(),
        assetCode: this.asset().code,
        destination: this.stellarAddress()
      });

      this.showQrCode.set(true);
    }
  }

  closeQrCode() {
    this.showQrCode.set(false);
    this.clear();
    this.validatorService.stopValidation();
  }

  copyToClipboard() {
    this.clipboard.copy(this.qrCodeValue());
  }

  simulatePaymentSuccess() {
    const memo = `Debug_${Date.now()}`;
    const mockValidation = {
      memo,
      expectedAmount: this.displayValue(),
      assetCode: this.asset().code,
      destination: this.stellarAddress(),
      isPaid: true,
      checkCount: 1,
      transactionId: 'debug-tx-' + Date.now()
    };

    // Add a mock payment to history first
    this.historyService.addPayment({
      id: Date.now().toString(),
      amount: this.displayValue(),
      assetCode: this.asset().code,
      destination: this.stellarAddress(),
      timestamp: Date.now(),
      paymentUrl: 'debug-url',
      memo,
      isPaid: false
    });

    // Then update its status to trigger the animation
    this.validatorService.stopValidation();
    this.historyService.updatePaymentStatus(memo, true, mockValidation.transactionId);
    this.showQrCode.set(true);
    this.paymentStatus.set('paid');
  }
}
