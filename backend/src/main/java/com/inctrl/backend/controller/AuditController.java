package com.inctrl.backend.controller;

import com.inctrl.backend.dto.CommitInfo;
import com.inctrl.backend.dto.IngestRequest;
import com.inctrl.backend.dto.ChatRequest;
import com.inctrl.backend.dto.ChatResponse;
import com.inctrl.backend.service.GitHubService;
import com.inctrl.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    /**
     * Fetches the latest commits from a GitHub repository.
     */
    @GetMapping("/commits")
    public ResponseEntity<List<CommitInfo>> getCommits(@RequestParam String repoUrl) {
        try {
            List<CommitInfo> commits = gitHubService.fetchCommitList(repoUrl);
            return ResponseEntity.ok(commits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
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

    /**
     * Handles a user's Q&A question about a specific commit.
     * Fetches the diff from GitHub and sends it to Gemini with the question.
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatAboutCommit(@RequestBody ChatRequest request) {
        try {
            // Re-fetch the GitHub diff to give Gemini full context
            String githubDiff = gitHubService.fetchCommitDetails(request.getGithubUrl());

            // Send to Gemini for a markdown-formatted answer with code references
            String answer = geminiService.chatWithCommit(githubDiff, request.getAiChatLog(), request.getQuestion());

            return ResponseEntity.ok(new ChatResponse(answer));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ChatResponse("Error: " + e.getMessage()));
        }
    }
}
