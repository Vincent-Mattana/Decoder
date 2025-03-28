export type CipherType = 'caesar' | 'atbash';

export interface Message {
  id: number;
  text: string;
  shift: number;
  cipherType: CipherType;
  code?: string; // Optional unique code for message selection
} 