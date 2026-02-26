package com.inctrl.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commit_sha", nullable = false, unique = true)
    private String commitSha;

    @Lob
    @Column(name = "content", columnDefinition = "CLOB")
    private String content;

    public Note() {}

    public Note(String commitSha, String content) {
        this.commitSha = commitSha;
        this.content = content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCommitSha() { return commitSha; }
    public void setCommitSha(String commitSha) { this.commitSha = commitSha; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
