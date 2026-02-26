package com.inctrl.backend.dto;

public class ChatRequest {
    private String githubUrl;
    private String commitSha;
    private String question;
    private String aiChatLog;

    public ChatRequest() {}

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getCommitSha() { return commitSha; }
    public void setCommitSha(String commitSha) { this.commitSha = commitSha; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAiChatLog() { return aiChatLog; }
    public void setAiChatLog(String aiChatLog) { this.aiChatLog = aiChatLog; }
}
