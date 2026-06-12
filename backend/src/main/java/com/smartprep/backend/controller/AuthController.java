package com.smartprep.backend.controller;

import com.smartprep.backend.dto.AuthResponse;
import com.smartprep.backend.dto.LoginRequest;
import com.smartprep.backend.dto.SignupRequest;
import com.smartprep.backend.entity.User;
import com.smartprep.backend.repository.UserRepository;
import com.smartprep.backend.service.CustomUserDetailsService;
import com.smartprep.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(AuthResponse.message("Invalid credentials"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(AuthResponse.token(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(AuthResponse.message("Email is already registered"));
        }

        User user = new User();
        user.setName(signupRequest.getName());
        // Derive username from email (portion before @)
        String username = signupRequest.getEmail().split("@")[0];
        user.setUsername(username);
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(AuthResponse.message("User registered successfully"));
    }
}
