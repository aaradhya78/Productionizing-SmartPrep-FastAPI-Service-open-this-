package com.smartprep.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizSubmissionResponse {
    private String message;
    private Long resultId;
}
