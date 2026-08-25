package com.moneymate.service;

import com.moneymate.dto.CheckInResponse;
import com.moneymate.dto.DailyStreakInfoDto;
import com.moneymate.dto.WarrenBuffettQuoteDto;
import com.moneymate.entity.StreakCheckInEntity;
import com.moneymate.entity.TransactionEntity;
import com.moneymate.repository.StreakCheckInRepository;
import com.moneymate.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class StreakService {

    private final StreakCheckInRepository streakCheckInRepository;
    private final TransactionRepository transactionRepository;

    public static final List<WarrenBuffettQuoteDto> WARREN_BUFFETT_QUOTES = Arrays.asList(
            new WarrenBuffettQuoteDto("wb-1", "Do not save what is left after spending, but spend what is left after saving.", "Pay your future self first before spending on today.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-2", "If you buy things you do not need, soon you will have to sell things you need.", "Financial freedom begins by eliminating mindless spending.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-3", "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.", "Protecting your capital and knowing where every rupee goes is paramount.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-4", "Someone is sitting in the shade today because someone planted a tree a long time ago.", "Every transaction you track today builds your lifelong wealth tree.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-5", "Price is what you pay. Value is what you get.", "Look at the true long-term value in every single expenditure.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-6", "Accounting is the language of business. Tracking your money is the foundation of personal freedom.", "Knowing your numbers gives you total control over your life.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-7", "The most important investment you can make is in yourself and your financial discipline.", "Daily consistency always beats temporary intensity.", "Warren Buffett"),
            new WarrenBuffettQuoteDto("wb-8", "Risk comes from not knowing what you are doing. Awareness is the cure.", "By logging your finances daily, you eliminate financial uncertainty.", "Warren Buffett")
    );

    private final AtomicInteger quoteIndex = new AtomicInteger(0);

    public StreakService(
            StreakCheckInRepository streakCheckInRepository,
            TransactionRepository transactionRepository) {
        this.streakCheckInRepository = streakCheckInRepository;
        this.transactionRepository = transactionRepository;
    }

    public DailyStreakInfoDto calculateStreak(String userId) {
        List<TransactionEntity> transactions = transactionRepository.findByUserIdOrderByTransactionDateDescTransactionTimeDescCreatedAtDesc(userId);
        List<StreakCheckInEntity> checkIns = streakCheckInRepository.findByUserIdOrderByCheckInDateAsc(userId);

        LocalDate today = LocalDate.now();
        String todayStr = today.toString();
        String yesterdayStr = today.minusDays(1).toString();
        String dayBeforeStr = today.minusDays(2).toString();

        Set<String> activeDates = new HashSet<>();
        for (TransactionEntity t : transactions) {
            if (t.getTransactionDate() != null) {
                activeDates.add(t.getTransactionDate());
            }
        }
        for (StreakCheckInEntity c : checkIns) {
            if (c.getCheckInDate() != null) {
                activeDates.add(c.getCheckInDate());
            }
        }

        boolean isLoggedToday = activeDates.contains(todayStr);
        boolean isLoggedYesterday = activeDates.contains(yesterdayStr);
        boolean isLoggedDayBefore = activeDates.contains(dayBeforeStr);

        int currentStreak = 0;
        LocalDate checkDate = today;
        if (!isLoggedToday) {
            checkDate = today.minusDays(1);
        }

        while (true) {
            String dStr = checkDate.toString();
            if (activeDates.contains(dStr)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }

        boolean isGracePeriodActive = false;
        int graceHoursRemaining = 24;

        if (!isLoggedToday && !isLoggedYesterday && isLoggedDayBefore) {
            isGracePeriodActive = true;
            LocalTime now = LocalTime.now();
            graceHoursRemaining = Math.max(1, 24 - now.getHour());
        }

        WarrenBuffettQuoteDto quote = getActiveQuote();

        DailyStreakInfoDto dto = new DailyStreakInfoDto();
        dto.setCurrentStreak(currentStreak);
        dto.setLongestStreak(Math.max(currentStreak, activeDates.size()));
        dto.setTotalDaysLogged(activeDates.size());
        dto.setIsLoggedToday(isLoggedToday);
        dto.setIsGracePeriodActive(isGracePeriodActive);
        dto.setGraceHoursRemaining(graceHoursRemaining);
        dto.setLastLoggedDate(isLoggedToday ? todayStr : isLoggedYesterday ? yesterdayStr : null);
        dto.setQuote(quote);
        dto.setPunchline(quote);

        return dto;
    }

    @Transactional
    public CheckInResponse recordCheckIn(String userId) {
        String todayStr = LocalDate.now().toString();
        if (!streakCheckInRepository.existsByUserIdAndCheckInDate(userId, todayStr)) {
            StreakCheckInEntity checkIn = new StreakCheckInEntity(
                    "chk_" + userId + "_" + todayStr,
                    userId,
                    todayStr
            );
            streakCheckInRepository.save(checkIn);

            DailyStreakInfoDto streakInfo = calculateStreak(userId);
            return new CheckInResponse(true, streakInfo.getCurrentStreak(), "🔥 Streak maintained! Logged ₹0 spent for today.");
        }

        DailyStreakInfoDto streakInfo = calculateStreak(userId);
        return new CheckInResponse(true, streakInfo.getCurrentStreak(), "⚡ You have already secured your streak for today!");
    }

    @Transactional
    public CheckInResponse recoverStreak(String userId) {
        LocalDate today = LocalDate.now();
        String todayStr = today.toString();
        String yesterdayStr = today.minusDays(1).toString();

        if (!streakCheckInRepository.existsByUserIdAndCheckInDate(userId, yesterdayStr)) {
            streakCheckInRepository.save(new StreakCheckInEntity(
                    "chk_" + userId + "_" + yesterdayStr,
                    userId,
                    yesterdayStr
            ));
        }
        if (!streakCheckInRepository.existsByUserIdAndCheckInDate(userId, todayStr)) {
            streakCheckInRepository.save(new StreakCheckInEntity(
                    "chk_" + userId + "_" + todayStr,
                    userId,
                    todayStr
            ));
        }

        DailyStreakInfoDto streakInfo = calculateStreak(userId);
        return new CheckInResponse(true, streakInfo.getCurrentStreak(), "🛡️ 24-Hour Grace Period applied! Your streak has been safely restored.");
    }

    public WarrenBuffettQuoteDto getActiveQuote() {
        int idx = Math.abs(quoteIndex.get() % WARREN_BUFFETT_QUOTES.size());
        return WARREN_BUFFETT_QUOTES.get(idx);
    }

    public WarrenBuffettQuoteDto shuffleQuote() {
        int next = quoteIndex.incrementAndGet();
        int idx = Math.abs(next % WARREN_BUFFETT_QUOTES.size());
        return WARREN_BUFFETT_QUOTES.get(idx);
    }
}
