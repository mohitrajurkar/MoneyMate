import { Transaction } from '../types';
import confetti from 'canvas-confetti';

export interface WarrenBuffettQuote {
  id: string;
  quote: string;
  context: string;
  author: string;
}

export const WARREN_BUFFETT_QUOTES: WarrenBuffettQuote[] = [
  {
    id: 'wb-1',
    quote: 'Do not save what is left after spending, but spend what is left after saving.',
    context: 'Pay your future self first before spending on today.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-2',
    quote: 'If you buy things you do not need, soon you will have to sell things you need.',
    context: 'Financial freedom begins by eliminating mindless spending.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-3',
    quote: 'Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.',
    context: 'Protecting your capital and knowing where every rupee goes is paramount.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-4',
    quote: 'Someone is sitting in the shade today because someone planted a tree a long time ago.',
    context: 'Every transaction you track today builds your lifelong wealth tree.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-5',
    quote: 'Price is what you pay. Value is what you get.',
    context: 'Look at the true long-term value in every single expenditure.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-6',
    quote: 'Accounting is the language of business. Tracking your money is the foundation of personal freedom.',
    context: 'Knowing your numbers gives you total control over your life.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-7',
    quote: 'The most important investment you can make is in yourself and your financial discipline.',
    context: 'Daily consistency always beats temporary intensity.',
    author: 'Warren Buffett',
  },
  {
    id: 'wb-8',
    quote: 'Risk comes from not knowing what you are doing. Awareness is the cure.',
    context: 'By logging your finances daily, you eliminate financial uncertainty.',
    author: 'Warren Buffett',
  },
];

export interface DailyStreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  isLoggedToday: boolean;
  isGracePeriodActive: boolean; // 24-hour grace period available
  graceHoursRemaining: number;
  lastLoggedDate: string | null;
  quote: WarrenBuffettQuote;
  punchline: WarrenBuffettQuote;
}

export type FinancialPunchline = WarrenBuffettQuote;


const STORAGE_KEYS = {
  MANUAL_CHECKINS: 'moneymate_streak_checkins',
  ACTIVE_QUOTE_INDEX: 'moneymate_active_wb_quote_idx',
  RECOVERED_DATES: 'moneymate_streak_recovered_dates',
};

export class StreakService {
  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCheckIns(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MANUAL_CHECKINS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Option to log "No transaction happened today" to maintain the streak
   */
  public recordNoTransactionCheckIn(): { success: boolean; streak: number; message: string } {
    const today = this.formatDate(new Date());
    const checkIns = this.getCheckIns();
    if (!checkIns.includes(today)) {
      checkIns.push(today);
      localStorage.setItem(STORAGE_KEYS.MANUAL_CHECKINS, JSON.stringify(checkIns));
      this.triggerConfetti();
      return {
        success: true,
        streak: this.calculateStreak([]).currentStreak,
        message: '🔥 Streak maintained! Logged ₹0 spent for today.',
      };
    }
    return {
      success: true,
      streak: this.calculateStreak([]).currentStreak,
      message: '⚡ You have already secured your streak for today!',
    };
  }

  /**
   * 24-Hour Grace Period Recovery: Recover yesterday or today if missed
   */
  public recoverStreak(): { success: boolean; streak: number; message: string } {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDate(yesterday);
    const todayStr = this.formatDate(new Date());

    const checkIns = this.getCheckIns();
    if (!checkIns.includes(yesterdayStr)) {
      checkIns.push(yesterdayStr);
    }
    if (!checkIns.includes(todayStr)) {
      checkIns.push(todayStr);
    }
    localStorage.setItem(STORAGE_KEYS.MANUAL_CHECKINS, JSON.stringify(checkIns));
    this.triggerConfetti();
    return {
      success: true,
      streak: this.calculateStreak([]).currentStreak,
      message: '🛡️ 24-Hour Grace Period applied! Your streak has been safely restored.',
    };
  }

  /**
   * Calculate streak from real transaction dates and zero-transaction check-ins
   */
  public calculateStreak(transactions: Transaction[] = []): DailyStreakInfo {
    const today = new Date();
    const todayStr = this.formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = this.formatDate(yesterday);

    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);
    const dayBeforeStr = this.formatDate(dayBeforeYesterday);

    // Active dates set (Transaction added OR "No transaction" check-in)
    const activeDatesSet = new Set<string>();

    transactions.forEach((t) => {
      if (t.transactionDate) {
        activeDatesSet.add(t.transactionDate);
      }
    });

    const checkIns = this.getCheckIns();
    checkIns.forEach((d) => activeDatesSet.add(d));

    const isLoggedToday = activeDatesSet.has(todayStr);
    const isLoggedYesterday = activeDatesSet.has(yesterdayStr);
    const isLoggedDayBefore = activeDatesSet.has(dayBeforeStr);

    // Calculate active streak
    let currentStreak = 0;
    const checkDate = new Date(today);

    // If not logged today, check if yesterday was logged
    if (!isLoggedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = this.formatDate(checkDate);
      if (activeDatesSet.has(dateStr)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 24-hour Grace period logic:
    // If yesterday was missed but day before was logged, or user has an active streak needing review within 24h
    let isGracePeriodActive = false;
    let graceHoursRemaining = 24;

    if (!isLoggedToday && !isLoggedYesterday && isLoggedDayBefore) {
      isGracePeriodActive = true;
      // Calculate remaining hours until end of today
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      graceHoursRemaining = Math.max(1, Math.round((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));
    }

    const quote = this.getRandomQuote();

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, activeDatesSet.size),
      totalDaysLogged: activeDatesSet.size,
      isLoggedToday,
      isGracePeriodActive,
      graceHoursRemaining,
      lastLoggedDate: isLoggedToday ? todayStr : isLoggedYesterday ? yesterdayStr : null,
      quote,
      punchline: quote,
    };
  }

  public getRandomQuote(): WarrenBuffettQuote {
    try {
      const savedIdx = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUOTE_INDEX);
      if (savedIdx !== null) {
        const parsed = parseInt(savedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < WARREN_BUFFETT_QUOTES.length) {
          return WARREN_BUFFETT_QUOTES[parsed];
        }
      }
    } catch {
      // fallback
    }
    return WARREN_BUFFETT_QUOTES[0];
  }

  public shuffleQuote(): WarrenBuffettQuote {
    const currentIdx = parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_QUOTE_INDEX) || '0', 10);
    const nextIdx = (currentIdx + 1) % WARREN_BUFFETT_QUOTES.length;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_QUOTE_INDEX, nextIdx.toString());
    return WARREN_BUFFETT_QUOTES[nextIdx];
  }

  public shufflePunchline(): WarrenBuffettQuote {
    return this.shuffleQuote();
  }

  public recordDailyCheckIn(): { success: boolean; streak: number; message: string } {
    return this.recordNoTransactionCheckIn();
  }

  public triggerConfetti(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3fb950', '#58a6ff', '#f0883e', '#d29922', '#a371f7'],
      });
    } catch {
      // Confetti fallback
    }
  }
}

export const streakService = new StreakService();
