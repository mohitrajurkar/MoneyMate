package com.moneymate.service;

import com.moneymate.dto.FinancialHealthScoreDto;
import com.moneymate.entity.AccountEntity;
import com.moneymate.entity.BudgetEntity;
import com.moneymate.entity.TransactionEntity;
import com.moneymate.repository.AccountRepository;
import com.moneymate.repository.BudgetRepository;
import com.moneymate.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FinancialHealthService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public FinancialHealthService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    public FinancialHealthScoreDto calculateFinancialHealth(String userId) {
        List<AccountEntity> accounts = accountRepository.findByUserIdOrderByCreatedAtAsc(userId);
        List<TransactionEntity> transactions = transactionRepository.findByUserIdOrderByTransactionDateDescTransactionTimeDescCreatedAtDesc(userId);
        List<BudgetEntity> budgets = budgetRepository.findByUserId(userId);

        double totalIncome = transactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getTransactionType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getTransactionType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        // 1. Savings Rate (0 - 100) -> 35% weight
        double netSavings = Math.max(0.0, totalIncome - totalExpense);
        double savingsRate = totalIncome > 0 ? Math.min(100.0, Math.round((netSavings / totalIncome) * 100.0)) : 0.0;

        // 2. Budget Adherence (0 - 100) -> 30% weight
        double budgetAdherence = 100.0;
        if (!budgets.isEmpty()) {
            long withinBudgetCount = budgets.stream().filter(b -> (b.getSpent() != null ? b.getSpent() : 0.0) <= b.getAmount()).count();
            budgetAdherence = Math.round(((double) withinBudgetCount / budgets.size()) * 100.0);
        }

        // 3. Spending Consistency (0 - 100) -> 20% weight
        double spendingConsistency = (totalIncome > 0 && (totalExpense / totalIncome) < 0.7) ? 88.0 : 65.0;

        // 4. Debt Ratio (0 - 100) -> 15% weight
        double creditDebt = accounts.stream()
                .filter(a -> "CREDIT_CARD".equalsIgnoreCase(a.getAccountType()))
                .mapToDouble(a -> a.getBalance() != null ? a.getBalance() : 0.0)
                .sum();

        double liquidAssets = accounts.stream()
                .filter(a -> !"CREDIT_CARD".equalsIgnoreCase(a.getAccountType()))
                .mapToDouble(a -> a.getBalance() != null ? a.getBalance() : 0.0)
                .sum();

        double debtRatio = liquidAssets > 0 ? Math.min(100.0, Math.round((creditDebt / liquidAssets) * 100.0)) : 0.0;
        double debtHealthScore = Math.max(0.0, 100.0 - debtRatio * 2.0);

        // Composite Score (0 - 100)
        long compositeScore = Math.round(
                savingsRate * 0.35 +
                budgetAdherence * 0.30 +
                spendingConsistency * 0.20 +
                debtHealthScore * 0.15
        );

        int finalScore = (int) Math.min(100, Math.max(10, compositeScore));

        String rating = "Needs Attention";
        if (finalScore >= 80) rating = "Excellent";
        else if (finalScore >= 65) rating = "Good";
        else if (finalScore >= 45) rating = "Fair";

        List<String> insights = new ArrayList<>();
        if (savingsRate >= 30) {
            insights.add("Strong savings rate of " + (int) savingsRate + "%. You are outpacing inflation!");
        } else {
            insights.add("Your current savings rate is " + (int) savingsRate + "%. Aim for at least 25% of monthly income.");
        }

        long overBudgetCount = budgets.stream().filter(b -> (b.getSpent() != null ? b.getSpent() : 0.0) > b.getAmount()).count();
        if (overBudgetCount > 0) {
            insights.add("Warning: " + overBudgetCount + " budget categories have exceeded their limit this month.");
        } else {
            insights.add("Great discipline! All active budgets are currently within allocated limits.");
        }

        if (creditDebt > 0 && debtRatio < 20) {
            insights.add("Your credit utilization is healthy at " + (int) debtRatio + "% of total liquid assets.");
        } else if (creditDebt > 0) {
            insights.add("Consider clearing ₹" + String.format("%,.0f", creditDebt) + " credit card outstanding to avoid interest.");
        }

        return new FinancialHealthScoreDto(
                finalScore,
                rating,
                savingsRate,
                budgetAdherence,
                spendingConsistency,
                debtRatio,
                insights
        );
    }
}
