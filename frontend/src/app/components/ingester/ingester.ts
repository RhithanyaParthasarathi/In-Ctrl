import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, IngestRequest, AiAnalysis, CommitInfo } from '../../services/api';
import { AuditDashboardComponent } from '../audit-dashboard/audit-dashboard';

@Component({
  selector: 'app-ingester',
  standalone: true,
  imports: [CommonModule, FormsModule, AuditDashboardComponent],
  templateUrl: './ingester.html',
  styleUrls: ['./ingester.css']
})
export class IngesterComponent {
  // Mode toggle: 'repo' (primary) or 'manual' (fallback)
  inputMode: 'repo' | 'manual' = 'repo';

  // Repo mode fields
  repoUrl: string = '';
  commits: CommitInfo[] = [];
  selectedCommit: CommitInfo | null = null;
  isFetchingCommits: boolean = false;
  fetchError: string = '';

  // Manual mode / shared fields
  githubUrl: string = '';
  aiChatLog: string = '';

  // State variables for the UI
  isLoading: boolean = false;
  successData: any = null;
  errorMessage: string = '';

  // Feature B: Parsed AI Analysis Data
  aiAnalysis: AiAnalysis | null = null;
  isDashboardVisible: boolean = false;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Toggle between repo selector and manual URL input
   */
  toggleMode() {
    this.inputMode = this.inputMode === 'repo' ? 'manual' : 'repo';
    this.errorMessage = '';
    this.fetchError = '';
  }

  /**
   * Fetch the latest commits from the entered repo URL
   */
  fetchCommits() {
    if (!this.repoUrl) {
      this.fetchError = 'Please enter a GitHub repository URL.';
      return;
    }

    this.isFetchingCommits = true;
    this.fetchError = '';
    this.commits = [];
    this.selectedCommit = null;

    this.apiService.fetchCommits(this.repoUrl).subscribe({
      next: (commits) => {
        this.isFetchingCommits = false;
        this.commits = commits;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isFetchingCommits = false;
        this.fetchError = 'Failed to fetch commits. Ensure the repository URL is valid and the repo is public.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Select a commit from the fetched list
   */
  selectCommit(commit: CommitInfo) {
    this.selectedCommit = commit;
  }

  /**
   * Format the commit date to a readable relative time
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Truncate long commit messages
   */
  truncateMessage(msg: string, max: number = 72): string {
    const firstLine = msg.split('\n')[0];
    return firstLine.length > max ? firstLine.substring(0, max) + '...' : firstLine;
  }

  /**
   * Called when the user clicks the "Analyze Commit" button
   */
  onSubmit() {
    // Build the commit URL from the selected mode
    let commitUrl = '';
    if (this.inputMode === 'repo') {
      if (!this.selectedCommit) {
        this.errorMessage = 'Please select a commit to analyze.';
        return;
      }
      // Build the full commit URL from repo URL + selected SHA
      const repoBase = this.repoUrl.replace(/\/+$/, '').replace(/\.git$/, '');
      commitUrl = `${repoBase}/commit/${this.selectedCommit.sha}`;
    } else {
      if (!this.githubUrl) {
        this.errorMessage = 'Please provide a GitHub Commit URL.';
        return;
      }
      commitUrl = this.githubUrl;
    }

    // Prepare data and set loading state
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;
    this.aiAnalysis = null;
    this.isDashboardVisible = false;

    const request: IngestRequest = {
      githubUrl: commitUrl,
      aiChatLog: this.aiChatLog
    };

    // Call the Spring Boot API
    this.apiService.ingestCommit(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successData = response;

        try {
          // Parse the AI JSON string returned from the backend
          this.aiAnalysis = JSON.parse(response.analysis) as AiAnalysis;
          this.isDashboardVisible = true;
        } catch (e) {
          console.error("Failed to parse Gemini JSON", e);
          this.errorMessage = "Failed to parse the AI analysis response.";
        }

        this.cdr.detectChanges(); // Force Angular to update the UI
        console.log('Success:', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'An error occurred while connecting to the server.';
        this.cdr.detectChanges(); // Force Angular to update the UI
        console.error('Error:', error);
      }
    });
  }
}
