package com.smartprep.backend.service;

import com.smartprep.backend.dto.QuizSubmissionRequest;
import com.smartprep.backend.entity.QuizResult;
import com.smartprep.backend.entity.User;
import com.smartprep.backend.repository.QuizResultRepository;
import com.smartprep.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class QuizService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    public QuizResult submitQuiz(QuizSubmissionRequest request, String userEmail) {
        QuizResult result = new QuizResult();
        result.setTopic(request.getTopic());
        result.setTotalQuestions(request.getTotalQuestions());
        result.setScore(request.getScore());
        result.setTakenAt(LocalDateTime.now());

        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(result::setUser);
        }

        return quizResultRepository.save(result);
    }
}
