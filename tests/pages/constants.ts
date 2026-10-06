/** Saved payee used across domestic-transfer scenarios (fictional, valid checksum). */
export const KISS_PETER = {
  name: 'Kiss Péter',
  iban: 'HU72 9990 1017 1618 0339 8874 9892',
} as const;

/** Fresh Everyday / Savings balances from the plan oracle. */
export const FRESH = {
  everydayIban: 'HU39 9992 0265 3141 5926 5358 9797',
  everydayBalance: '1,250,000 HUF',
  savingsIban: 'HU03 9992 0265 2718 2818 2845 9043',
  savingsBalance: '5,400,000 HUF',
} as const;
