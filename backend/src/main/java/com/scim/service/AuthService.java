package com.scim.service;

import com.scim.dto.auth.request.LoginRequest;
import com.scim.dto.auth.request.RefreshTokenRequest;
import com.scim.dto.auth.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(String refreshToken);
}
