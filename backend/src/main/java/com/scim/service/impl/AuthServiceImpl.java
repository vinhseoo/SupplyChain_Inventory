package com.scim.service.impl;

import com.scim.dto.auth.request.LoginRequest;
import com.scim.dto.auth.request.RefreshTokenRequest;
import com.scim.dto.auth.response.AuthResponse;
import com.scim.dto.user.response.UserResponse;
import com.scim.entity.RefreshToken;
import com.scim.entity.User;
import com.scim.exception.UnauthorizedException;
import com.scim.config.security.CustomUserDetails;
import com.scim.config.security.JwtTokenProvider;
import com.scim.repository.RefreshTokenRepository;
import com.scim.repository.UserRepository;
import com.scim.service.AuthService;
import com.scim.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
            String refreshTokenString = jwtTokenProvider.generateRefreshToken(user.getEmail());

            // Delete old refresh tokens for this user
            refreshTokenRepository.deleteByUserId(user.getId());

            // Save new refresh token
            RefreshToken refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(refreshTokenString)
                    .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000))
                    .build();
            refreshTokenRepository.save(refreshToken);

            UserResponse userResponse = userService.getById(user.getId());

            log.info("User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshTokenString)
                    .user(userResponse)
                    .build();
        } catch (Exception e) {
            log.warn("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");
        }
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenStr = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String newRefreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Rotate token: delete old, save new
        refreshTokenRepository.delete(refreshToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        UserResponse userResponse = userService.getById(user.getId());

        log.info("Token refreshed successfully for user: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshTokenStr) {
        refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(token -> {
            refreshTokenRepository.delete(token);
            log.info("User logged out, deleted refresh token");
        });
    }
}
