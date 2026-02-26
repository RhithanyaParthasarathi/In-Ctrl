package com.inctrl.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audited_commits")
public class AuditedCommit {

    @Id
    @Column(name = "commit_sha", nullable = false, unique = true)
    private String commitSha;

    @Column(name = "repo_url", nullable = false)
    private String repoUrl;

    @Lob
    @Column(name = "analysis_json", columnDefinition = "CLOB", nullable = false)
    private String analysisJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public AuditedCommit() {}

    public AuditedCommit(String commitSha, String repoUrl, String analysisJson) {
        this.commitSha = commitSha;
        this.repoUrl = repoUrl;
        this.analysisJson = analysisJson;
        this.createdAt = LocalDateTime.now();
    }

    public String getCommitSha() { return commitSha; }
    public void setCommitSha(String commitSha) { this.commitSha = commitSha; }

    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }

    public String getAnalysisJson() { return analysisJson; }
    public void setAnalysisJson(String analysisJson) { this.analysisJson = analysisJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
