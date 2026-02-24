package com.inctrl.backend.dto;

public class IngestRequest {
    private String githubUrl;
    private String aiChatLog;

    // Default constructor for JSON parsing
    public IngestRequest() {}

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getAiChatLog() {
        return aiChatLog;
    }

    public void setAiChatLog(String aiChatLog) {
        this.aiChatLog = aiChatLog;
    }
}
