import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface representing the data we send to the Spring Boot backend
 */
export interface IngestRequest {
  githubUrl: string;
  aiChatLog: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  authorName: string;
  date: string;
}

export interface AiFault {
  point: string;
  risk: string;
}

export interface AiAlternative {
  method: string;
  justification: string;
}

export interface AiAnalysis {
  summary: string;
  technologies: string[];
  alternatives: AiAlternative[];
  faults: AiFault[];
}

export interface AuditResponse {
  status: string;
  message: string;
  analysis: string; // The JSON string we need to parse
}

// --- Chat Interfaces ---
export interface ChatRequest {
  githubUrl: string;
  commitSha: string;
  question: string;
  aiChatLog: string;
}

export interface ChatResponse {
  answer: string;
}

import { SafeHtml } from '@angular/platform-browser';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string | SafeHtml;
}

// --- Note Interface ---
export interface Note {
  id?: number;
  commitSha: string;
  content: string;
}

// --- History Interface ---
export interface AuditedCommit {
  id?: number;
  commitSha: string;
  repoUrl: string;
  analysisJson: string;
  createdAt: string;
  tag?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL of our Spring Boot Backend
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  /**
   * Fetches the latest commits from a GitHub repository with pagination.
   */
  fetchCommits(repoUrl: string, page: number = 1): Observable<CommitInfo[]> {
    return this.http.get<CommitInfo[]>(`${this.baseUrl}/audit/commits`, {
      params: { repoUrl, page: page.toString() }
    });
  }

  /**
   * Sends the GitHub URL and AI Chat log to the backend for ingestion.
   */
  ingestCommit(request: IngestRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/audit/ingest`, request);
  }

  /**
   * Sends a question about a commit to the backend for AI-powered Q&A.
   */
  chatAboutCommit(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/audit/chat`, request);
  }

  /**
   * Fetches the developer note for a specific commit SHA and section.
   */
  getNote(commitSha: string, section: string = 'summary'): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/notes/${commitSha}?section=${section}`);
  }

  /**
   * Saves (or updates) a developer note for a commit SHA and section.
   */
  saveNote(commitSha: string, content: string, section: string = 'summary'): Observable<Note> {
    return this.http.post<Note>(`${this.baseUrl}/notes`, { commitSha, content, section });
  }

  /**
   * Fetches all saved AI analyses from the database history.
   */
  getHistory(): Observable<AuditedCommit[]> {
    return this.http.get<AuditedCommit[]>(`${this.baseUrl}/history`);
  }

  /**
   * Saves raw AI analysis to the database history.
   */
  saveHistory(payload: any): Observable<AuditedCommit> {
    return this.http.post<AuditedCommit>(`${this.baseUrl}/history`, payload);
  }

  /**
   * Lightweight update: patches only the tag field of an existing commit record.
   */
  updateTag(commitSha: string, tag: string): Observable<AuditedCommit> {
    return this.http.patch<AuditedCommit>(`${this.baseUrl}/history/${commitSha}/tag`, { tag });
  }
}
