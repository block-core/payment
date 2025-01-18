import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, StellarAsset } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>
      
      <div class="form-group">
        <label for="stellarAddress">Stellar Address</label>
        <input
          id="stellarAddress"
          type="text"
          [(ngModel)]="stellarAddress"
          placeholder="Enter your Stellar address"
          (change)="saveStellarAddress()"
        />
        <p class="help-text">This address will be used to receive payments</p>
      </div>

      <div class="form-group">
        <label for="asset">Asset</label>
        <select id="asset" [(ngModel)]="selectedAsset.code" (change)="saveAsset()">
          <option value="EURMTL">EURMTL (mtl.montelibero.org)</option>
          <option value="XLM">XLM (Lumen)</option>
        </select>
        <p class="help-text">Select the asset for payments</p>
      </div>
    </div>
  `,
  styles: `
    .settings-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }

    select {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      background-color: white;
    }
  `
})
export class SettingsComponent implements OnInit {
  stellarAddress = '';
  selectedAsset: StellarAsset = {
    code: 'EURMTL',
    issuer: SettingsService.EURMTL_ISSUER
  };

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getStellarAddress().subscribe(address => {
      this.stellarAddress = address;
    });
    this.settingsService.getAsset().subscribe(asset => {
      this.selectedAsset = asset;
    });
  }

  saveStellarAddress() {
    this.settingsService.setStellarAddress(this.stellarAddress);
  }

  saveAsset() {
    // Update issuer based on selected asset
    if (this.selectedAsset.code === 'EURMTL') {
      this.selectedAsset.issuer = SettingsService.EURMTL_ISSUER;
    } else {
      delete this.selectedAsset.issuer; // XLM doesn't need an issuer
    }
    
    this.settingsService.setAsset(this.selectedAsset);
  }
}
