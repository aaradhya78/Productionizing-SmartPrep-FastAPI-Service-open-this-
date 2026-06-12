package com.smartprep.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.smartprep.backend.service.AiCommunicationService;
import com.smartprep.backend.repository.MaterialRepository;
import com.smartprep.backend.repository.QuizResultRepository;
import com.smartprep.backend.repository.UserRepository;
import com.smartprep.backend.repository.ScheduleRepository;
import com.smartprep.backend.entity.Material;
import com.smartprep.backend.entity.User;
import com.smartprep.backend.entity.QuizResult;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GenerationController {

    @Autowired
    private AiCommunicationService aiService;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @PostMapping("/notes/generate")
    public ResponseEntity<?> generateNotes(@RequestBody Map<String, String> payload) {
        String materialId = payload.get("materialId");
        String text = getMaterialContent(materialId);
        Map<String, Object> notes = aiService.generateNotes(text);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/quiz/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, String> payload) {
        String materialId = payload.get("materialId");
        String text = getMaterialContent(materialId);
        Map<String, Object> quiz = aiService.generateQuiz(text);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/flashcards/generate")
    public ResponseEntity<?> generateFlashcards(@RequestBody Map<String, String> payload) {
        String materialId = payload.get("materialId");
        String text = getMaterialContent(materialId);
        Map<String, Object> flashcards = aiService.generateFlashcards(text);
        return ResponseEntity.ok(flashcards);
    }

    @PostMapping("/pyq/analyze")
    public ResponseEntity<?> analyzePYQ(@RequestBody Map<String, String> payload) {
        String materialId = payload.get("materialId");
        String text = getMaterialContent(materialId);
        Map<String, Object> analysis = aiService.analyzePYQ(text);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/schedule/generate")
    public ResponseEntity<?> generateSchedule(@RequestBody Map<String, Object> scheduleReq) {
        Map<String, Object> plan = aiService.generateSchedule(scheduleReq);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/analytics/stats")
    public ResponseEntity<?> getAnalyticsStats() {
        String userEmail = getAuthenticatedUserEmail();
        List<Map<String, Object>> quizResults = new ArrayList<>();
        double completionRate = 0.70;

        if (userEmail != null) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Load actual quiz results
                List<QuizResult> results = quizResultRepository.findByUserId(user.getId());
                for (QuizResult qr : results) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("topic", qr.getTopic());
                    m.put("score", qr.getScore());
                    m.put("totalQuestions", qr.getTotalQuestions());
                    quizResults.add(m);
                }
                
                // Fetch schedules to calculate completion rate if any
                List<?> schedules = scheduleRepository.findByUserId(user.getId());
                if (!schedules.isEmpty()) {
                    completionRate = 0.80; // Heuristic: user has actively configured planner
                }
            }
        }

        // We don't have mock tests stored in DB (they are local to frontend state), 
        // so we pass an empty list and let FastAPI merge with defaults
        List<Map<String, Object>> mockResults = new ArrayList<>();

        Map<String, Object> stats = aiService.getAnalyticsStats(quizResults, mockResults, completionRate);
        return ResponseEntity.ok(stats);
    }

    private String getMaterialContent(String materialId) {
        if (materialId != null) {
            try {
                Optional<Material> matOpt = materialRepository.findById(Long.parseLong(materialId));
                if (matOpt.isPresent() && matOpt.get().getExtractedContent() != null) {
                    return matOpt.get().getExtractedContent();
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch material: " + e.getMessage());
            }
        }
        return "Standard algorithms and computer systems material discussing sorting and database architectures.";
    }

    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        return null;
    }
}
