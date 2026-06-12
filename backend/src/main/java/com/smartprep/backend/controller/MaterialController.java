package com.smartprep.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.smartprep.backend.repository.MaterialRepository;
import com.smartprep.backend.repository.UserRepository;
import com.smartprep.backend.entity.Material;
import com.smartprep.backend.entity.User;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://localhost:8000";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(@RequestParam("files") MultipartFile[] files) {
        String userEmail = getAuthenticatedUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access."));
        }

        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found."));
        }
        User user = userOpt.get();

        List<Map<String, String>> uploadedFiles = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String extractedContent = "";
            try {
                // Forward file bytes to FastAPI for processing, cleaning, and OCR support
                extractedContent = callTextExtractionService(file);
            } catch (Exception e) {
                System.err.println("FastAPI extraction failed for " + file.getOriginalFilename() + ": " + e.getMessage());
                extractedContent = "Failed to run AI text extraction. Fallback placeholder content.";
            }

            Material material = new Material();
            material.setUser(user);
            material.setFilename(file.getOriginalFilename());
            
            String contentType = file.getContentType();
            String ext = file.getOriginalFilename() != null ? file.getOriginalFilename().split("\\.")[file.getOriginalFilename().split("\\.").length - 1] : "pdf";
            material.setFileType(ext);
            material.setExtractedContent(extractedContent);
            material.setUploadedAt(LocalDateTime.now());

            Material savedMat = materialRepository.save(material);

            Map<String, String> fInfo = new HashMap<>();
            fInfo.put("filename", savedMat.getFilename());
            fInfo.put("fileId", String.valueOf(savedMat.getId()));
            uploadedFiles.add(fInfo);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Files uploaded and processed successfully");
        if (!uploadedFiles.isEmpty()) {
            response.put("fileId", uploadedFiles.get(0).get("fileId"));
        }
        response.put("files", uploadedFiles);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<?> getMaterials() {
        String userEmail = getAuthenticatedUserEmail();
        if (userEmail == null) {
            return ResponseEntity.ok(new Object[]{});
        }
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (!userOpt.isPresent()) {
            return ResponseEntity.ok(new Object[]{});
        }
        
        List<Material> materials = materialRepository.findByUserId(userOpt.get().getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Material m : materials) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", String.valueOf(m.getId()));
            map.put("filename", m.getFilename());
            map.put("fileType", m.getFileType());
            map.put("uploadedAt", m.getUploadedAt().toString());
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> renameMaterial(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Material> matOpt = materialRepository.findById(Long.parseLong(id));
        if (matOpt.isPresent()) {
            Material material = matOpt.get();
            material.setFilename(body.get("filename"));
            materialRepository.save(material);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Material renamed successfully");
            response.put("newFilename", material.getFilename());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(Map.of("error", "Material not found."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable String id) {
        Optional<Material> matOpt = materialRepository.findById(Long.parseLong(id));
        if (matOpt.isPresent()) {
            materialRepository.delete(matOpt.get());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Material deleted successfully");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(Map.of("error", "Material not found."));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadMaterial(@PathVariable String id) {
        Optional<Material> matOpt = materialRepository.findById(Long.parseLong(id));
        if (matOpt.isPresent()) {
            Material m = matOpt.get();
            String content = m.getExtractedContent() != null ? m.getExtractedContent() : "Empty text content.";
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + m.getFilename() + "\"")
                .body(content);
        }
        return ResponseEntity.status(404).body("Material not found.");
    }

    private String callTextExtractionService(MultipartFile file) throws IOException {
        String url = FASTAPI_URL + "/extract-text";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", fileResource);
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("text");
        }
        return "";
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
