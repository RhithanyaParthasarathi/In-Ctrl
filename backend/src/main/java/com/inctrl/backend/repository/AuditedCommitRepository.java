package com.inctrl.backend.repository;

import com.inctrl.backend.model.AuditedCommit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditedCommitRepository extends JpaRepository<AuditedCommit, String> {
    List<AuditedCommit> findAllByOrderByCreatedAtDesc();
}
