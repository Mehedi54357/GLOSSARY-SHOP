export interface Product {
  id?: number;
  name: string; // সাধারণ বাংলায় নাম
  dialectName?: string; // আঞ্চলিক নাম (ঐচ্ছিক)
  quantity: number;
  price: number;
}

export interface DialectMapping {
  id?: number;
  dialect_word: string;
  standard_word: string;
  district?: string;
}