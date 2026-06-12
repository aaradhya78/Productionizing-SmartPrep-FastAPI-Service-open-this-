package com.smartprep.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "materials")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String filename;

    private String fileType;
    
    @Column(columnDefinition = "TEXT")
    private String extractedContent;

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
