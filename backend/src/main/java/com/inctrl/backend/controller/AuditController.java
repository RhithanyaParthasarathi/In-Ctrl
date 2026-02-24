package com.inctrl.backend.controller;

import com.inctrl.backend.dto.IngestRequest;
import com.inctrl.backend.service.GitHubService;
import com.inctrl.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4200")
public class AuditController {

    private final GitHubService gitHubService;
    private final GeminiService geminiService;

    public AuditController(GitHubService gitHubService, GeminiService geminiService) {
        this.gitHubService = gitHubService;
        this.geminiService = geminiService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingestCommitContext(@RequestBody IngestRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Step 1: Fetch the raw commit diff from GitHub
            String githubData = gitHubService.fetchCommitDetails(request.getGithubUrl());

            // Step 2: Send the diff + chat context to Gemini for analysis
            String aiAnalysisJsonString = geminiService.analyzeCommit(githubData, request.getAiChatLog());

            response.put("status", "success");
            response.put("message", "Commit analyzed successfully");
            // Returning the stringified JSON from the LLM
            response.put("analysis", aiAnalysisJsonString);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
