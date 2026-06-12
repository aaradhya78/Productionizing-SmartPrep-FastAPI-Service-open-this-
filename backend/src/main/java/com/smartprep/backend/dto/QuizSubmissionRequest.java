package com.smartprep.backend.dto;

import lombok.Data;

@Data
public class QuizSubmissionRequest {
    private String topic;
    private int totalQuestions;
    private int score;
}
