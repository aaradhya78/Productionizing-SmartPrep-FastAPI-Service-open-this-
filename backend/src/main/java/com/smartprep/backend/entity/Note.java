package com.smartprep.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime generatedAt = LocalDateTime.now();
}
