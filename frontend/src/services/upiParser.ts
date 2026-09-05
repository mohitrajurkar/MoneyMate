import { ParsedUpiData, TransactionSource, TransactionType, Transaction, DuplicateCheckResult } from '../types';

export interface UpiParserStrategy {
  canParse(text: string): boolean;
  parse(text: string): ParsedUpiData | null;
  getSource(): TransactionSource;
}

// Comprehensive Merchant-to-Category Mapping
export const MERCHANT_CATEGORY_MAP: Record<string, { category: string; type: TransactionType }> = {
  swiggy: { category: 'Food & Dining', type: 'EXPENSE' },
  zomato: { category: 'Food & Dining', type: 'EXPENSE' },
  mcdonalds: { category: 'Food & Dining', type: 'EXPENSE' },
  starbucks: { category: 'Food & Dining', type: 'EXPENSE' },
  dominos: { category: 'Food & Dining', type: 'EXPENSE' },
  burger: { category: 'Food & Dining', type: 'EXPENSE' },
  cafe: { category: 'Food & Dining', type: 'EXPENSE' },
  restaurant: { category: 'Food & Dining', type: 'EXPENSE' },
  chai: { category: 'Food & Dining', type: 'EXPENSE' },
  food: { category: 'Food & Dining', type: 'EXPENSE' },

  uber: { category: 'Transportation', type: 'EXPENSE' },
  ola: { category: 'Transportation', type: 'EXPENSE' },
  rapido: { category: 'Transportation', type: 'EXPENSE' },
  metro: { category: 'Transportation', type: 'EXPENSE' },
  irctc: { category: 'Transportation', type: 'EXPENSE' },
  petrol: { category: 'Transportation', type: 'EXPENSE' },
  fuel: { category: 'Transportation', type: 'EXPENSE' },
  indianoil: { category: 'Transportation', type: 'EXPENSE' },
  hpcl: { category: 'Transportation', type: 'EXPENSE' },
  bpcl: { category: 'Transportation', type: 'EXPENSE' },

  amazon: { category: 'Shopping', type: 'EXPENSE' },
  flipkart: { category: 'Shopping', type: 'EXPENSE' },
  myntra: { category: 'Shopping', type: 'EXPENSE' },
  ajio: { category: 'Shopping', type: 'EXPENSE' },
  zara: { category: 'Shopping', type: 'EXPENSE' },
  h_m: { category: 'Shopping', type: 'EXPENSE' },
  blinkit: { category: 'Groceries', type: 'EXPENSE' },
  zepto: { category: 'Groceries', type: 'EXPENSE' },
  instamart: { category: 'Groceries', type: 'EXPENSE' },
  bigbasket: { category: 'Groceries', type: 'EXPENSE' },
  dmart: { category: 'Groceries', type: 'EXPENSE' },

  netflix: { category: 'Entertainment', type: 'EXPENSE' },
  spotify: { category: 'Entertainment', type: 'EXPENSE' },
  hotstar: { category: 'Entertainment', type: 'EXPENSE' },
  bookmyshow: { category: 'Entertainment', type: 'EXPENSE' },
  pvr: { category: 'Entertainment', type: 'EXPENSE' },
  inox: { category: 'Entertainment', type: 'EXPENSE' },
  youtube: { category: 'Entertainment', type: 'EXPENSE' },
  apple: { category: 'Entertainment', type: 'EXPENSE' },

  airtel: { category: 'Bills & Utilities', type: 'EXPENSE' },
  jio: { category: 'Bills & Utilities', type: 'EXPENSE' },
  vi: { category: 'Bills & Utilities', type: 'EXPENSE' },
  bescom: { category: 'Bills & Utilities', type: 'EXPENSE' },
  tneb: { category: 'Bills & Utilities', type: 'EXPENSE' },
  electricity: { category: 'Bills & Utilities', type: 'EXPENSE' },
  water: { category: 'Bills & Utilities', type: 'EXPENSE' },
  gas: { category: 'Bills & Utilities', type: 'EXPENSE' },
  broadband: { category: 'Bills & Utilities', type: 'EXPENSE' },
  rent: { category: 'Housing & Rent', type: 'EXPENSE' },

  apollo: { category: 'Healthcare', type: 'EXPENSE' },
  pharmacy: { category: 'Healthcare', type: 'EXPENSE' },
  medplus: { category: 'Healthcare', type: 'EXPENSE' },
  hospital: { category: 'Healthcare', type: 'EXPENSE' },
  practo: { category: 'Healthcare', type: 'EXPENSE' },
  '1mg': { category: 'Healthcare', type: 'EXPENSE' },

  zerodha: { category: 'Investments', type: 'EXPENSE' },
  groww: { category: 'Investments', type: 'EXPENSE' },
  kuvera: { category: 'Investments', type: 'EXPENSE' },
  upstox: { category: 'Investments', type: 'EXPENSE' },
  mutual: { category: 'Investments', type: 'EXPENSE' },
  sip: { category: 'Investments', type: 'EXPENSE' },

  salary: { category: 'Salary', type: 'INCOME' },
  payroll: { category: 'Salary', type: 'INCOME' },
  dividend: { category: 'Investments', type: 'INCOME' },
  refund: { category: 'Refund / Cashback', type: 'INCOME' },
  cashback: { category: 'Refund / Cashback', type: 'INCOME' },
  interest: { category: 'Interest Income', type: 'INCOME' },
};

export function suggestCategoryAndType(merchantOrText: string): { category: string; type: TransactionType } {
  const lower = merchantOrText.toLowerCase();

  // Check for income keywords first
  if (lower.includes('salary') || lower.includes('payroll') || lower.includes('credited by employer')) {
    return { category: 'Salary', type: 'INCOME' };
  }
  if (lower.includes('cashback') || lower.includes('reward') || lower.includes('refund')) {
    return { category: 'Refund / Cashback', type: 'INCOME' };
  }
  if (lower.includes('interest') || lower.includes('dividend')) {
    return { category: 'Investments', type: 'INCOME' };
  }

  for (const [key, mapping] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (lower.includes(key)) {
      return mapping;
    }
  }

  // Default fallback
  const isCredit = lower.includes('credited') || lower.includes('received') || lower.includes('deposit');
  return {
    category: isCredit ? 'Other Income' : 'General & Misc',
    type: isCredit ? 'INCOME' : 'EXPENSE',
  };
}

/** Extract amount helper */
function extractAmount(text: string): number | null {
  // Matches: ₹ 450, Rs. 1,200.50, INR 3,000, 450.00, Rs 500
  const amountRegexes = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|paid|debited|credited|transferred)\s*(?:of)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:inr|rs|rupees)/i,
  ];

  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const clean = match[1].replace(/,/g, '');
      const num = parseFloat(clean);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

/** Extract UPI Ref / UTR / Transaction ID */
function extractUpiRef(text: string): string | undefined {
  const refRegexes = [
    /(?:upi\s*ref(?:erence)?(?:\s*no\.?|\s*id)?|utr(?:\s*no\.?)?|txn\s*id|ref\s*no\.?|rrn)\s*[:=\-]?\s*([a-zA-Z0-9]{8,24})/i,
    /(?:ref|rrn|txn)\s*#?\s*([0-9]{8,16})/i,
  ];

  for (const regex of refRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

/** Google Pay Parser Strategy */
export class GooglePayParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('google pay') || lower.includes('gpay') || lower.includes('paid on google pay');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'Google Pay Merchant';
    // e.g. "Paid ₹450 to Swiggy using Google Pay" or "You paid ₹1,200 to Starbucks India"
    const merchantMatch = text.match(/(?:paid|transferred|sent)\s*(?:₹|rs\.?|inr)?\s*[\d,.]*\s*to\s+([^.\n,]+?)(?:\s+using|\s+via|\s+on|\s+upi|\.|$)/i)
      || text.match(/to\s+([^.\n,]+?)\s+(?:using|on|via)\s+google\s*pay/i);

    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI (Google Pay)',
      upiRefId,
      suggestedCategory: category,
      source: 'GOOGLE_PAY',
      rawText: text,
      confidence: 0.95,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'GOOGLE_PAY';
  }
}

/** PhonePe Parser Strategy */
export class PhonePeParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('phonepe') || lower.includes('phone pe');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'PhonePe Merchant';
    // e.g. "Payment to Zomato of ₹380 was successful" or "Paid to Uber ₹150 via PhonePe"
    const merchantMatch = text.match(/(?:payment|paid|sent)\s+to\s+([^.\n,]+?)(?:\s+of|\s+was|\s+via|\s+using|\.|$)/i)
      || text.match(/to\s+([^.\n,]+?)\s+successful/i);

    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI (PhonePe)',
      upiRefId,
      suggestedCategory: category,
      source: 'PHONEPE',
      rawText: text,
      confidence: 0.95,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'PHONEPE';
  }
}

/** Paytm Parser Strategy */
export class PaytmParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('paytm') || lower.includes('paytm wallet');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'Paytm Merchant';
    // e.g. "Paid successfully ₹799 to Netflix on Paytm"
    const merchantMatch = text.match(/(?:to|at)\s+([^.\n,]+?)(?:\s+on paytm|\s+via paytm|\s+using paytm|\.|$)/i)
      || text.match(/paid\s+(?:successfully)?\s*(?:₹|rs\.?|inr)?\s*[\d,.]*\s+to\s+([^.\n,]+)/i);

    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI (Paytm)',
      upiRefId,
      suggestedCategory: category,
      source: 'PAYTM',
      rawText: text,
      confidence: 0.92,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'PAYTM';
  }
}

/** Slice Parser Strategy */
export class SliceParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('slice') || lower.includes('slice card') || lower.includes('slice upi') || lower.includes('paid on slice');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'Slice Merchant';
    const merchantMatch =
      text.match(/(?:paid|transferred|spent|to)\s+(?:₹|rs\.?|inr)?\s*[\d,.]*\s*(?:to|at)?\s+([^.\n,]+?)(?:\s+using|\s+via|\s+on slice|\s+upi|\.|$)/i) ||
      text.match(/at\s+([^.\n,]+?)\s+(?:using|on|via)\s+slice/i) ||
      text.match(/to\s+([^.\n,]+)/i);

    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].replace(/slice\s*(upi|card)?/i, '').trim() || 'Slice Merchant';
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI (Slice)',
      upiRefId,
      suggestedCategory: category,
      source: 'SLICE',
      rawText: text,
      confidence: 0.94,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'SLICE';
  }
}

/** CRED Parser Strategy */
export class CredParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('cred') || lower.includes('cred pay') || lower.includes('cred upi');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'CRED Payee';
    const merchantMatch = text.match(/(?:paid|to|at)\s+([^.\n,]+?)(?:\s+using cred|\s+on cred|\s+via cred|\.|$)/i);
    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI (CRED)',
      upiRefId,
      suggestedCategory: category,
      source: 'CRED',
      rawText: text,
      confidence: 0.93,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'CRED';
  }
}

/** BHIM / UPI Generic Parser Strategy */
export class BhimParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('bhim') || lower.includes('npci');
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'BHIM Recipient';
    const merchantMatch = text.match(/(?:paid|sent|to)\s+([^.\n,]+)/i);
    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'BHIM UPI',
      upiRefId,
      suggestedCategory: category,
      source: 'BHIM',
      rawText: text,
      confidence: 0.92,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'BHIM';
  }
}

/** Bank SMS Parser Strategy (HDFC, ICICI, SBI, Axis, Kotak, etc.) */
export class BankSmsParser implements UpiParserStrategy {
  canParse(text: string): boolean {
    const lower = text.toLowerCase();
    return (
      (lower.includes('debited') || lower.includes('credited') || lower.includes('spent') || lower.includes('withdrawn')) &&
      (lower.includes('a/c') || lower.includes('acct') || lower.includes('card') || lower.includes('vpa') || lower.includes('bank') || lower.includes('inr'))
    );
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    const lower = text.toLowerCase();
    const isCredit = lower.includes('credited') || lower.includes('received') || lower.includes('deposit');
    const transType: TransactionType = isCredit ? 'INCOME' : 'EXPENSE';

    let merchant = isCredit ? 'Salary / Sender' : 'Merchant / Store';

    // Patterns like "to AMAZON INDIA via UPI" or "at STARBUCKS" or "info: SWIGGY"
    const merchantMatch = text.match(/(?:to|at|info[:\s]+|vpa\s+)\s*([^.\n,]+?)(?:\s+on|\s+via|\s+ref|\s+avail|\s+bal|\.|$)/i);
    if (merchantMatch && merchantMatch[1]) {
      const candidate = merchantMatch[1].replace(/A\/C.*$/i, '').trim();
      if (candidate.length > 2 && !candidate.toLowerCase().includes('dear customer')) {
        merchant = candidate;
      }
    }

    const { category } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: transType,
      paymentMethod: lower.includes('upi') ? 'UPI' : lower.includes('card') ? 'Credit/Debit Card' : 'Bank Transfer',
      upiRefId,
      suggestedCategory: category,
      source: 'BANK_SMS',
      rawText: text,
      confidence: 0.9,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'BANK_SMS';
  }
}

/** Generic / UPI Parser Fallback */
export class GenericUpiParser implements UpiParserStrategy {
  canParse(_text: string): boolean {
    return true; // Universal fallback
  }

  parse(text: string): ParsedUpiData | null {
    const amount = extractAmount(text);
    if (!amount) return null;

    let merchant = 'UPI Recipient';
    const merchantMatch = text.match(/(?:to|at|paid to)\s+([^.\n,]+)/i);
    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
    }

    const { category, type } = suggestCategoryAndType(merchant + ' ' + text);
    const upiRefId = extractUpiRef(text);

    return {
      amount,
      merchant,
      transactionType: type,
      paymentMethod: 'UPI',
      upiRefId,
      suggestedCategory: category,
      source: 'UPI_IMPORT',
      rawText: text,
      confidence: 0.75,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    };
  }

  getSource(): TransactionSource {
    return 'UPI_IMPORT';
  }
}

/** Parser Manager / Factory that orchestrates Strategy pattern */
export class UpiParserManager {
  private strategies: UpiParserStrategy[] = [
    new GooglePayParser(),
    new PhonePeParser(),
    new PaytmParser(),
    new SliceParser(),
    new CredParser(),
    new BhimParser(),
    new BankSmsParser(),
    new GenericUpiParser(),
  ];

  public parseText(rawText: string): ParsedUpiData | null {
    if (!rawText || !rawText.trim()) return null;

    for (const strategy of this.strategies) {
      if (strategy.canParse(rawText)) {
        const result = strategy.parse(rawText);
        if (result) return result;
      }
    }

    return null;
  }

  /**
   * Duplicate Detection Rule:
   * 1. Exact UPI reference ID match
   * OR
   * 2. Same user + identical amount + matching date + similar merchant
   */
  public checkForDuplicate(
    candidate: { amount: number; merchant: string; date?: string; upiRefId?: string },
    existingTransactions: Transaction[]
  ): DuplicateCheckResult {
    // 1. UPI Ref match
    if (candidate.upiRefId) {
      const matchByRef = existingTransactions.find(
        (t) => t.upiRefId && t.upiRefId.toLowerCase() === candidate.upiRefId!.toLowerCase()
      );
      if (matchByRef) {
        return {
          isDuplicate: true,
          matchType: 'UPI_REF',
          existingTransaction: matchByRef,
          message: `Duplicate UPI Reference ID (${candidate.upiRefId}) already recorded.`,
        };
      }
    }

    // 2. Amount + Date + Merchant similarity match
    const candidateDate = candidate.date || new Date().toISOString().split('T')[0];
    const candidateMerchant = candidate.merchant.toLowerCase().replace(/[^a-z0-9]/g, '');

    const matchByDetails = existingTransactions.find((t) => {
      const isAmountMatch = Math.abs(t.amount - candidate.amount) < 0.01;
      const isDateMatch = t.transactionDate === candidateDate;
      const existingMerchant = t.merchant.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isMerchantMatch =
        candidateMerchant.includes(existingMerchant) ||
        existingMerchant.includes(candidateMerchant) ||
        candidateMerchant.slice(0, 4) === existingMerchant.slice(0, 4);

      return isAmountMatch && isDateMatch && isMerchantMatch;
    });

    if (matchByDetails) {
      return {
        isDuplicate: true,
        matchType: 'EXACT_MATCH',
        existingTransaction: matchByDetails,
        message: `Similar transaction of ₹${candidate.amount.toLocaleString('en-IN')} to "${matchByDetails.merchant}" already exists on ${matchByDetails.transactionDate}.`,
      };
    }

    return { isDuplicate: false };
  }
}

export const upiParserManager = new UpiParserManager();
