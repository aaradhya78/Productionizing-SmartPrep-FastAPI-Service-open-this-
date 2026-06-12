package com.smartprep.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate examDate;

    private int studyHoursPerDay;

    @Column(columnDefinition = "TEXT")
    private String subjectsJson; // Storing subjects as JSON string for simplicity

    @Column(columnDefinition = "TEXT")
    private String generatedPlanJson;

    private LocalDateTime createdAt = LocalDateTime.now();
}
