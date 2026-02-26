package com.inctrl.backend.repository;

import com.inctrl.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByCommitSha(String commitSha);
    Optional<Note> findByCommitShaAndSection(String commitSha, String section);
}
