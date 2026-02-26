package com.inctrl.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notes", uniqueConstraints = @UniqueConstraint(columnNames={"commit_sha", "section"}))
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commit_sha", nullable = false)
    private String commitSha;

    @Column(name = "section", nullable = false)
    private String section;

    @Lob
    @Column(name = "content", columnDefinition = "CLOB")
    private String content;

    public Note() {}

    public Note(String commitSha, String section, String content) {
        this.commitSha = commitSha;
        this.section = section;
        this.content = content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCommitSha() { return commitSha; }
    public void setCommitSha(String commitSha) { this.commitSha = commitSha; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
