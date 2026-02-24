package com.inctrl.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitHubService {

    private final RestTemplate restTemplate;

    public GitHubService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Parses a standard GitHub commit URL and fetches the raw commit data from the GitHub API.
     * @param githubUrl The url e.g., https://github.com/owner/repo/commit/sha
     * @return The raw JSON response from GitHub containing files and patch diffs.
     */
    public String fetchCommitDetails(String githubUrl) {
        // Regex to extract owner, repo, and commit SHA from the URL
        Pattern pattern = Pattern.compile("github\\.com/([^/]+)/([^/]+)/commit/([a-fA-F0-9]+)");
        Matcher matcher = pattern.matcher(githubUrl);
        
        if (matcher.find()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2);
            String sha = matcher.group(3);
            
            // GitHub REST API endpoint for fetching a specific commit
            String apiUrl = String.format("https://api.github.com/repos/%s/%s/commits/%s", owner, repo, sha);
            
            try {
                // Fetch the commit data as a raw JSON string for now
                ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
                return response.getBody();
            } catch (Exception e) {
                throw new RuntimeException("Failed to fetch from GitHub API. Ensure the repository is public or you have provided a token. Error: " + e.getMessage());
            }
        }
        throw new IllegalArgumentException("Invalid GitHub Commit URL. Please provide a URL in the format: https://github.com/owner/repo/commit/sha");
    }
}
