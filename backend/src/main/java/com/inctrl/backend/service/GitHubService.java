package com.inctrl.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.inctrl.backend.dto.CommitInfo;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitHubService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GitHubService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Parses a GitHub repository URL and fetches the latest commits.
     * 
     * @param repoUrl e.g., https://github.com/owner/repo
     * @param page The page number for pagination (starts at 1)
     * @return List of CommitInfo DTOs with sha, message, author, date.
     */
    public List<CommitInfo> fetchCommitList(String repoUrl, int page) {
        // Regex to extract owner and repo from the URL
        Pattern pattern = Pattern.compile("github\\.com/([^/]+)/([^/]+)");
        Matcher matcher = pattern.matcher(repoUrl);

        if (matcher.find()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2).replaceAll("\\.git$", "");

            String apiUrl = String.format("https://api.github.com/repos/%s/%s/commits?per_page=10&page=%d", owner, repo, page);

            try {
                ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
                JsonNode commitsArray = objectMapper.readTree(response.getBody());

                List<CommitInfo> commits = new ArrayList<>();
                for (JsonNode node : commitsArray) {
                    String sha = node.get("sha").asText();
                    JsonNode commitNode = node.get("commit");
                    String message = commitNode.get("message").asText();
                    String authorName = commitNode.get("author").get("name").asText();
                    String date = commitNode.get("author").get("date").asText();
                    commits.add(new CommitInfo(sha, message, authorName, date));
                }
                return commits;
            } catch (Exception e) {
                throw new RuntimeException(
                        "Failed to fetch commits from GitHub API. Ensure the repository is public. Error: "
                                + e.getMessage());
            }
        }
        throw new IllegalArgumentException(
                "Invalid GitHub Repository URL. Please provide a URL like: https://github.com/owner/repo");
    }

    /**
     * Parses a standard GitHub commit URL and fetches the raw commit data from the
     * GitHub API.
     * 
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
                throw new RuntimeException(
                        "Failed to fetch from GitHub API. Ensure the repository is public or you have provided a token. Error: "
                                + e.getMessage());
            }
        }
        throw new IllegalArgumentException(
                "Invalid GitHub Commit URL. Please provide a URL in the format: https://github.com/owner/repo/commit/sha");
    }
}
