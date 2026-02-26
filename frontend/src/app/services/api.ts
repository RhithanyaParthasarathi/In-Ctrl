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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL of our Spring Boot Backend
  private baseUrl = 'http://localhost:8080/api/audit';

  constructor(private http: HttpClient) { }

  /**
   * Fetches the latest commits from a GitHub repository.
   */
  fetchCommits(repoUrl: string): Observable<CommitInfo[]> {
    return this.http.get<CommitInfo[]>(`${this.baseUrl}/commits`, {
      params: { repoUrl }
    });
  }

  /**
   * Sends the GitHub URL and AI Chat log to the backend for ingestion.
   */
  ingestCommit(request: IngestRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/ingest`, request);
  }
}
