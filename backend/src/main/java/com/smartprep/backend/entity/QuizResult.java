package com.smartprep.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "quiz_results")
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO:
    // When frontend JWT authentication is integrated,
    // make QuizResult.user mandatory again and require authenticated submissions.
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String topic;

    private int totalQuestions;
    
    private int score;

    private LocalDateTime takenAt = LocalDateTime.now();
}
