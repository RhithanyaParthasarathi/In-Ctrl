package com.inctrl.backend.controller;

import com.inctrl.backend.dto.CommitInfo;
import com.inctrl.backend.dto.IngestRequest;
import com.inctrl.backend.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular dev server to call this API
public class AuditController {

    private final GitHubService gitHubService;

    // Spring automatically injects the GitHubService here
    public AuditController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
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
            // Step 1: Use the GitHubService to get the commit diff
            String githubData = gitHubService.fetchCommitDetails(request.getGithubUrl());
            
            // Step 2: (Coming later when we integrate OpenAI/Gemini)
            // Combine githubData with request.getAiChatLog() and send to the AI
            
            // For now, let's just return success so we know the plumbing works!
            response.put("status", "success");
            response.put("message", "Successfully fetched commit from GitHub");
            response.put("githubRawData", githubData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
