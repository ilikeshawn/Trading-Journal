
export interface User {
  id: string;
  email: string;
  username: string;
  name: string; // First name
  lastName: string; // Surname
  avatarUrl?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  currency: string;
  autoExtract: boolean;
}

export interface TradingAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  broker?: string;
  currency: string;
}

export interface TradeEntry {
  id: string;
  accountNumber: string; 
  date: string; // YYYY-MM-DD
  netProfit: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  avgTradeDuration?: string;
  screenshotUrl?: string;
  notes?: string;
  tags?: string[];
}

export interface TradingStats {
  totalProfit: number;
  winRate: number;
  avgDailyPnL: number;
  totalTrades: number;
  totalWins: number;
  totalLosses: number; // Sum of losses (absolute value)
  totalLossAmount: number; // Sum of negative P&L values
  avgTradeDuration: string;
  pnlCurve: { date: string; pnl: number }[];
  lossCurve: { date: string; loss: number }[];
}

export enum ViewMode {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  JOURNAL = 'JOURNAL',
  ANALYTICS = 'ANALYTICS',
  ACCOUNTS = 'ACCOUNTS',
  PROFILE = 'PROFILE'
}
