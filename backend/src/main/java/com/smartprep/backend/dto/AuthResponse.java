package com.smartprep.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String message;

    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    public static AuthResponse token(String token) {
        return new AuthResponse(token, null);
    }

    public static AuthResponse message(String message) {
        return new AuthResponse(null, message);
    }
}
