package com.inctrl.backend.controller;

import com.inctrl.backend.model.AuditedCommit;
import com.inctrl.backend.repository.AuditedCommitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH,
        RequestMethod.DELETE })
public class HistoryController {

    private final AuditedCommitRepository repository;

    public HistoryController(AuditedCommitRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<AuditedCommit>> getHistory() {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{commitSha}")
    public ResponseEntity<AuditedCommit> getHistoryBySha(@PathVariable String commitSha) {
        Optional<AuditedCommit> commit = repository.findById(commitSha);
        return commit.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AuditedCommit> saveHistory(@RequestBody Map<String, String> payload) {
        String commitSha = payload.get("commitSha");
        String repoUrl = payload.get("repoUrl");
        String analysisJson = payload.get("analysisJson");
        String tag = payload.get("tag");

        if (commitSha == null || repoUrl == null || analysisJson == null) {
            return ResponseEntity.badRequest().build();
        }

        AuditedCommit auditedCommit = repository.findById(commitSha)
                .orElse(new AuditedCommit(commitSha, repoUrl, analysisJson, tag));

        auditedCommit.setAnalysisJson(analysisJson);
        if (tag != null) {
            auditedCommit.setTag(tag);
        }

        AuditedCommit saved = repository.save(auditedCommit);

        return ResponseEntity.ok(saved);
    }

    /**
     * Fast endpoint to update ONLY the tag of an existing commit record.
     * Avoids re-sending the full analysisJson payload.
     */
    @PatchMapping("/{commitSha}/tag")
    public ResponseEntity<?> updateTag(@PathVariable String commitSha, @RequestBody Map<String, String> payload) {
        String tag = payload.get("tag");
        if (tag == null)
            return ResponseEntity.badRequest().build();

        Optional<AuditedCommit> existing = repository.findById(commitSha);
        if (existing.isPresent()) {
            AuditedCommit commit = existing.get();
            commit.setTag(tag);
            return ResponseEntity.ok(repository.save(commit));
        }
        return ResponseEntity.notFound().build();
    }
}
