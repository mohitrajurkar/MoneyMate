package com.moneymate.dto;

public class DailyStreakInfoDto {
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalDaysLogged;
    private Boolean isLoggedToday;
    private Boolean isGracePeriodActive;
    private Integer graceHoursRemaining;
    private String lastLoggedDate;
    private WarrenBuffettQuoteDto quote;
    private WarrenBuffettQuoteDto punchline;

    public DailyStreakInfoDto() {
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }

    public Integer getTotalDaysLogged() {
        return totalDaysLogged;
    }

    public void setTotalDaysLogged(Integer totalDaysLogged) {
        this.totalDaysLogged = totalDaysLogged;
    }

    public Boolean getIsLoggedToday() {
        return isLoggedToday;
    }

    public void setIsLoggedToday(Boolean isLoggedToday) {
        this.isLoggedToday = isLoggedToday;
    }

    public Boolean getIsGracePeriodActive() {
        return isGracePeriodActive;
    }

    public void setIsGracePeriodActive(Boolean isGracePeriodActive) {
        this.isGracePeriodActive = isGracePeriodActive;
    }

    public Integer getGraceHoursRemaining() {
        return graceHoursRemaining;
    }

    public void setGraceHoursRemaining(Integer graceHoursRemaining) {
        this.graceHoursRemaining = graceHoursRemaining;
    }

    public String getLastLoggedDate() {
        return lastLoggedDate;
    }

    public void setLastLoggedDate(String lastLoggedDate) {
        this.lastLoggedDate = lastLoggedDate;
    }

    public WarrenBuffettQuoteDto getQuote() {
        return quote;
    }

    public void setQuote(WarrenBuffettQuoteDto quote) {
        this.quote = quote;
    }

    public WarrenBuffettQuoteDto getPunchline() {
        return punchline;
    }

    public void setPunchline(WarrenBuffettQuoteDto punchline) {
        this.punchline = punchline;
    }
}
