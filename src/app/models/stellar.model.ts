export interface StellarPaymentParams {
    destination: string;
    amount: string;
    asset_code: string;
    asset_issuer: string;
    memo?: string;
    memo_type?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH';
    callback?: string;
}
