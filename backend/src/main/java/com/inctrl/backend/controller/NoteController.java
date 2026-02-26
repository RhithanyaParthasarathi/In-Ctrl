package com.inctrl.backend.controller;

import com.inctrl.backend.model.Note;
import com.inctrl.backend.repository.NoteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:4200")
public class NoteController {

    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * Fetches the developer note for a given commit SHA.
     * Returns 404 if no note exists yet.
     */
    @GetMapping("/{commitSha}")
    public ResponseEntity<Note> getNoteByCommitSha(@PathVariable String commitSha) {
        Optional<Note> note = noteRepository.findByCommitSha(commitSha);
        return note.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Creates or updates the developer note for a given commit SHA.
     * If a note already exists for the SHA, it is overwritten.
     */
    @PostMapping
    public ResponseEntity<Note> saveNote(@RequestBody Map<String, String> payload) {
        String commitSha = payload.get("commitSha");
        String content   = payload.get("content");

        if (commitSha == null || commitSha.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Upsert: update if exists, create if not
        Note note = noteRepository.findByCommitSha(commitSha)
                .orElse(new Note(commitSha, ""));

        note.setContent(content != null ? content : "");
        Note saved = noteRepository.save(note);
        return ResponseEntity.ok(saved);
    }
}
