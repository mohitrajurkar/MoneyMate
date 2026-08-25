import React, { useState, useMemo } from 'react';
import { Transaction, Account, Category } from '../../types';
import { formatDDMMYYYY, formatDateWithDayName } from '../../utils/dateUtils';
import { DayTransactionsModal } from './DayTransactionsModal';
import { Calendar } from 'lucide-react';

interface GitHubContributionGraphProps {
  transactions: Transaction[];
  accounts?: Account[];
  categories?: Category[];
  onAddTransactionForDate?: (dateStr: string) => void;
  onEditTransaction?: (txn: Transaction) => void;
}

interface DayData {
  date: string;
  dateObj: Date;
  count: number;
  amount: number;
  credited: number;
  debited: number;
  level: number;
  isFuture: boolean;
}

export const GitHubContributionGraph: React.FC<GitHubContributionGraphProps> = ({
  transactions = [],
  accounts = [],
  categories = [],
  onAddTransactionForDate,
  onEditTransaction,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    amount: number;
    credited: number;
    debited: number;
    x: number;
    y: number;
  } | null>(null);

  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Aggregate transaction counts, credits & debits per YYYY-MM-DD
  const dateMap = useMemo(() => {
    const map: Record<string, { count: number; amount: number; credited: number; debited: number }> = {};
    transactions.forEach((t) => {
      const d = t.transactionDate ? t.transactionDate.split('T')[0] : '';
      if (d) {
        if (!map[d]) {
          map[d] = { count: 0, amount: 0, credited: 0, debited: 0 };
        }
        map[d].count += 1;
        map[d].amount += t.amount;
        if (t.transactionType === 'INCOME') {
          map[d].credited += t.amount;
        } else if (t.transactionType === 'EXPENSE') {
          map[d].debited += t.amount;
        }
      }
    });
    return map;
  }, [transactions]);

  // Generate 53 weeks (Sunday to Saturday) ending with current week
  const { weeks, totalContributions, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayYMD = formatYMD(today);

    // Calculate start date: 52 weeks before current week's Sunday
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - (52 * 7) - today.getDay());
    startSunday.setHours(0, 0, 0, 0);

    const weeksList: DayData[][] = [];
    let contributions = 0;

    for (let w = 0; w < 53; w++) {
      const currentWeek: DayData[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startSunday);
        cellDate.setDate(startSunday.getDate() + (w * 7) + d);
        const dateStr = formatYMD(cellDate);
        const isFuture = dateStr > todayYMD;

        const data = dateMap[dateStr] || { count: 0, amount: 0, credited: 0, debited: 0 };

        let level = 0;
        if (!isFuture) {
          if (data.count >= 4 || data.amount >= 5000) level = 4;
          else if (data.count >= 3 || data.amount >= 2000) level = 3;
          else if (data.count >= 2 || data.amount >= 500) level = 2;
          else if (data.count >= 1) level = 1;
          contributions += data.count;
        }

        currentWeek.push({
          date: dateStr,
          dateObj: cellDate,
          count: data.count,
          amount: data.amount,
          credited: data.credited,
          debited: data.debited,
          level,
          isFuture,
        });
      }
      weeksList.push(currentWeek);
    }

    // Compute month label positions precisely aligned to week columns
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    let lastCol = -99;

    weeksList.forEach((week, colIdx) => {
      // Check if this column starts a new month
      const firstValidDay = week.find((d) => !d.isFuture) || week[0];
      if (firstValidDay) {
        const m = firstValidDay.dateObj.getMonth();
        if (m !== lastMonth && (colIdx - lastCol) >= 3) {
          labels.push({ label: monthNames[m], colIndex: colIdx });
          lastMonth = m;
          lastCol = colIdx;
        }
      }
    });

    return {
      weeks: weeksList,
      totalContributions: contributions,
      monthLabels: labels,
    };
  }, [dateMap]);

  return (
    <>
      <div id="github-activity-heatmap-card" className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-slate-200 shadow-sm">
        {/* Heatmap Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#21262d]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-semibold text-[#f0f6fc]">
              {totalContributions || transactions.length} financial transactions in the past year
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#21262d] text-[#58a6ff] border border-[#30363d]">
              Click any date to inspect
            </span>
          </div>
          <div className="text-xs text-[#8b949e] font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>52-Week Spending & Income Heatmap (DD-MM-YYYY)</span>
          </div>
        </div>

        {/* Heatmap Grid Section */}
        <div className="overflow-x-auto pb-1 relative no-scrollbar">
          <div className="w-fit min-w-[770px] pr-2">
            {/* Month Labels aligned to week columns */}
            <div className="flex pl-7 mb-1">
              <div
                className="relative h-4 text-[10px] text-[#8b949e] font-mono select-none"
                style={{ width: `${weeks.length * 14}px` }}
              >
                {monthLabels.map((m, idx) => (
                  <span
                    key={idx}
                    className="absolute top-0 whitespace-nowrap"
                    style={{ left: `${m.colIndex * 14}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Day Labels + 53 Week Columns */}
            <div className="flex items-start gap-1">
              {/* Day of week labels (Exact vertical match with 7 cell rows) */}
              <div
                className="grid grid-rows-7 gap-[3px] text-[9px] text-[#8b949e] font-mono select-none pr-1.5 w-6 text-right shrink-0"
                style={{ height: '95px' }}
              >
                <span className="h-[11px] leading-[11px]">Sun</span>
                <span className="h-[11px] leading-[11px] opacity-0 select-none">Mon</span>
                <span className="h-[11px] leading-[11px]">Tue</span>
                <span className="h-[11px] leading-[11px] opacity-0 select-none">Wed</span>
                <span className="h-[11px] leading-[11px]">Thu</span>
                <span className="h-[11px] leading-[11px] opacity-0 select-none">Fri</span>
                <span className="h-[11px] leading-[11px]">Sat</span>
              </div>

              {/* 53 Columns Grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-[3px]">
                    {week.map((day, dIdx) => {
                      if (day.isFuture) {
                        return (
                          <div
                            key={dIdx}
                            className="w-[11px] h-[11px] opacity-0 pointer-events-none"
                          />
                        );
                      }

                      return (
                        <div
                          key={dIdx}
                          id={`heatmap-cell-${day.date}`}
                          className={`gh-heatmap-cell gh-cell-${day.level} cursor-pointer transition-transform duration-100 hover:scale-130 hover:z-20 hover:ring-2 hover:ring-[#58a6ff]`}
                          onClick={() => setSelectedDateForModal(day.date)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              date: day.date,
                              count: day.count,
                              amount: day.amount,
                              credited: day.credited,
                              debited: day.debited,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none px-3 py-2 bg-[#161b22] text-[#f0f6fc] text-xs rounded-lg border border-[#30363d] shadow-2xl font-mono text-center -translate-x-1/2 -translate-y-full"
            style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
          >
            <div className="font-bold text-[#58a6ff] pb-0.5 border-b border-[#21262d] mb-1">
              {formatDDMMYYYY(hoveredDay.date)}
            </div>
            <div className="text-[11px] text-[#c9d1d9]">
              {hoveredDay.count === 0 ? (
                <span className="text-[#8b949e]">No transactions recorded</span>
              ) : (
                <span>
                  {hoveredDay.count} transaction{hoveredDay.count > 1 ? 's' : ''} (₹{hoveredDay.amount.toLocaleString('en-IN')})
                </span>
              )}
            </div>
            {hoveredDay.count > 0 && (
              <div className="flex items-center justify-center gap-2.5 text-[10px] mt-1 pt-0.5 border-t border-[#21262d]">
                {hoveredDay.credited > 0 && (
                  <span className="text-[#3fb950] font-semibold">+₹{hoveredDay.credited.toLocaleString('en-IN')}</span>
                )}
                {hoveredDay.debited > 0 && (
                  <span className="text-[#f85149] font-semibold">-₹{hoveredDay.debited.toLocaleString('en-IN')}</span>
                )}
              </div>
            )}
            <div className="text-[9px] text-[#8b949e] mt-1 pt-0.5 border-t border-[#21262d] font-sans">
              Click to view closing balance & transactions
            </div>
          </div>
        )}

        {/* Legend & Instructions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-2 border-t border-[#21262d] text-[11px] text-[#8b949e]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono">Date format: <strong className="text-[#f0f6fc]">DD-MM-YYYY</strong></span>
            <span>•</span>
            <span>Click any day square to open detailed transactions & day-end liquid balance modal</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>Less</span>
            <span className="gh-heatmap-cell gh-cell-0" title="0 transactions" />
            <span className="gh-heatmap-cell gh-cell-1" title="1 transaction or active" />
            <span className="gh-heatmap-cell gh-cell-2" title="2 transactions / ₹500+" />
            <span className="gh-heatmap-cell gh-cell-3" title="3 transactions / ₹2,000+" />
            <span className="gh-heatmap-cell gh-cell-4" title="4+ transactions / ₹5,000+" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Day Details Pop-up Modal */}
      {selectedDateForModal && (
        <DayTransactionsModal
          isOpen={Boolean(selectedDateForModal)}
          onClose={() => setSelectedDateForModal(null)}
          selectedDate={selectedDateForModal}
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          onAddTransactionForDate={onAddTransactionForDate}
          onEditTransaction={onEditTransaction}
        />
      )}
    </>
  );
};
