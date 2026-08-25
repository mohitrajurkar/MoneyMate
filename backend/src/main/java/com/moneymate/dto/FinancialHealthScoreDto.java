package com.moneymate.dto;

import java.util.List;

public class FinancialHealthScoreDto {
    private Integer score; // 0 - 100
    private String rating; // Excellent, Good, Fair, Needs Attention
    private Double savingsRate;
    private Double budgetAdherence;
    private Double spendingConsistency;
    private Double debtRatio;
    private List<String> insights;

    public FinancialHealthScoreDto() {
    }

    public FinancialHealthScoreDto(Integer score, String rating, Double savingsRate, Double budgetAdherence, Double spendingConsistency, Double debtRatio, List<String> insights) {
        this.score = score;
        this.rating = rating;
        this.savingsRate = savingsRate;
        this.budgetAdherence = budgetAdherence;
        this.spendingConsistency = spendingConsistency;
        this.debtRatio = debtRatio;
        this.insights = insights;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public Double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(Double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public Double getBudgetAdherence() {
        return budgetAdherence;
    }

    public void setBudgetAdherence(Double budgetAdherence) {
        this.budgetAdherence = budgetAdherence;
    }

    public Double getSpendingConsistency() {
        return spendingConsistency;
    }

    public void setSpendingConsistency(Double spendingConsistency) {
        this.spendingConsistency = spendingConsistency;
    }

    public Double getDebtRatio() {
        return debtRatio;
    }

    public void setDebtRatio(Double debtRatio) {
        this.debtRatio = debtRatio;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }
}
