package com.moneymate.service;

import com.moneymate.dto.*;
import com.moneymate.entity.*;
import com.moneymate.exception.BadRequestException;
import com.moneymate.exception.ResourceNotFoundException;
import com.moneymate.exception.UnauthorizedException;
import com.moneymate.repository.*;
import com.moneymate.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final DebtRepository debtRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository,
            DebtRepository debtRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.debtRepository = debtRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public static final List<CategoryEntity> DEFAULT_CATEGORY_TEMPLATES = Arrays.asList(
            new CategoryEntity(null, null, "Salary", "INCOME", "Wallet", "#10B981", true),
            new CategoryEntity(null, null, "Investments", "BOTH", "TrendingUp", "#6366F1", true),
            new CategoryEntity(null, null, "Refund / Cashback", "INCOME", "Gift", "#EC4899", true),
            new CategoryEntity(null, null, "Food & Dining", "EXPENSE", "Utensils", "#F59E0B", true),
            new CategoryEntity(null, null, "Shopping", "EXPENSE", "ShoppingBag", "#8B5CF6", true),
            new CategoryEntity(null, null, "Transportation", "EXPENSE", "Car", "#3B82F6", true),
            new CategoryEntity(null, null, "Groceries", "EXPENSE", "ShoppingCart", "#10B981", true),
            new CategoryEntity(null, null, "Bills & Utilities", "EXPENSE", "Zap", "#EF4444", true),
            new CategoryEntity(null, null, "Entertainment", "EXPENSE", "Film", "#F43F5E", true),
            new CategoryEntity(null, null, "Housing & Rent", "EXPENSE", "Home", "#06B6D4", true),
            new CategoryEntity(null, null, "Healthcare", "EXPENSE", "HeartPulse", "#14B8A6", true),
            new CategoryEntity(null, null, "Education", "EXPENSE", "BookOpen", "#F97316", true),
            new CategoryEntity(null, null, "General & Misc", "EXPENSE", "Tag", "#6B7280", true)
    );

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Registration attempt with existing email: {}", normalizedEmail);
            throw new BadRequestException("An account with this email already exists. Please log in.");
        }

        String userId = "user_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);
        UserEntity user = new UserEntity(
                userId,
                request.getName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                "USER",
                null,
                "₹"
        );

        userRepository.save(user);
        log.info("User registered successfully with id: {}", userId);

        // Seed default starter categories
        String foodCatId = null;
        String shoppingCatId = null;
        String billsCatId = null;

        for (int i = 0; i < DEFAULT_CATEGORY_TEMPLATES.size(); i++) {
            CategoryEntity tmpl = DEFAULT_CATEGORY_TEMPLATES.get(i);
            String catId = "cat_" + userId + "_" + i;
            CategoryEntity cat = new CategoryEntity(
                    catId,
                    userId,
                    tmpl.getName(),
                    tmpl.getType(),
                    tmpl.getIcon(),
                    tmpl.getColor(),
                    true
            );
            categoryRepository.save(cat);

            if ("Food & Dining".equals(tmpl.getName())) foodCatId = catId;
            if ("Shopping".equals(tmpl.getName())) shoppingCatId = catId;
            if ("Bills & Utilities".equals(tmpl.getName())) billsCatId = catId;
        }

        // Seed default starter budgets for current month
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        if (foodCatId != null) {
            BudgetEntity b1 = new BudgetEntity();
            b1.setId("bud_" + userId + "_1");
            b1.setUserId(userId);
            b1.setCategoryId(foodCatId);
            b1.setAmount(5000.0);
            b1.setSpent(0.0);
            b1.setMonth(month);
            b1.setYear(year);
            b1.setCreatedAt(Instant.now().toString());
            budgetRepository.save(b1);
        }

        if (shoppingCatId != null) {
            BudgetEntity b2 = new BudgetEntity();
            b2.setId("bud_" + userId + "_2");
            b2.setUserId(userId);
            b2.setCategoryId(shoppingCatId);
            b2.setAmount(5000.0);
            b2.setSpent(0.0);
            b2.setMonth(month);
            b2.setYear(year);
            b2.setCreatedAt(Instant.now().toString());
            budgetRepository.save(b2);
        }

        if (billsCatId != null) {
            BudgetEntity b3 = new BudgetEntity();
            b3.setId("bud_" + userId + "_3");
            b3.setUserId(userId);
            b3.setCategoryId(billsCatId);
            b3.setAmount(3000.0);
            b3.setSpent(0.0);
            b3.setMonth(month);
            b3.setYear(year);
            b3.setCreatedAt(Instant.now().toString());
            budgetRepository.save(b3);
        }

        // Seed welcome notification
        NotificationEntity welcomeNotif = new NotificationEntity(
                "notif_" + userId + "_welcome",
                userId,
                "Welcome to MoneyMate! 🎉",
                "Your clean personal finance workspace is ready. Add your bank account to start tracking expenses.",
                "SUCCESS",
                false
        );
        notificationRepository.save(welcomeNotif);

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getName());
        return new AuthResponse(token, mapToUserDto(user));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        UserEntity user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        // Generic error message to prevent account enumeration
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Failed authentication attempt for email: {}", normalizedEmail);
            throw new UnauthorizedException("Invalid email or password. Please check your credentials.");
        }

        log.info("User authenticated successfully with id: {}", user.getId());
        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getName());
        return new AuthResponse(token, mapToUserDto(user));
    }

    public UserDto getCurrentUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(String userId, ProfileUpdateRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            user.setCurrency(request.getCurrency());
        }

        user.setUpdatedAt(Instant.now().toString());
        userRepository.save(user);
        return mapToUserDto(user);
    }

    @Transactional
    public void resetUserDataToZero(String userId) {
        log.info("Resetting financial data for user: {}", userId);
        
        // Reset accounts to 0 balance
        List<AccountEntity> accounts = accountRepository.findByUserIdOrderByCreatedAtAsc(userId);
        for (AccountEntity acc : accounts) {
            acc.setBalance(0.0);
            acc.setUpdatedAt(Instant.now().toString());
            accountRepository.save(acc);
        }

        // Delete user transactions
        transactionRepository.deleteByUserId(userId);

        // Delete user debts
        debtRepository.deleteByUserId(userId);

        // Reset budgets spent to 0
        List<BudgetEntity> budgets = budgetRepository.findByUserId(userId);
        for (BudgetEntity b : budgets) {
            b.setSpent(0.0);
            budgetRepository.save(b);
        }
    }

    public UserDto mapToUserDto(UserEntity user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatar(),
                user.getCurrency(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
