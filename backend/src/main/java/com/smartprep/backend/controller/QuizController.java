package com.smartprep.backend.controller;

import com.smartprep.backend.dto.QuizSubmissionRequest;
import com.smartprep.backend.dto.QuizSubmissionResponse;
import com.smartprep.backend.entity.QuizResult;
import com.smartprep.backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/submit")
    public ResponseEntity<QuizSubmissionResponse> submitQuiz(@RequestBody QuizSubmissionRequest request) {
        String userEmail = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            userEmail = userDetails.getUsername();
        }

        QuizResult savedResult = quizService.submitQuiz(request, userEmail);
        
        QuizSubmissionResponse response = new QuizSubmissionResponse(
                "Quiz result saved successfully",
                savedResult.getId()
        );
        
        return ResponseEntity.ok(response);
    }
}
