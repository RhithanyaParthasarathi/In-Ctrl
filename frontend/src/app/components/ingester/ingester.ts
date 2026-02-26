import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, IngestRequest, AiAnalysis, CommitInfo } from '../../services/api';
import { AnalysisStateService } from '../../services/analysis-state.service';

@Component({
  selector: 'app-ingester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingester.html',
  styleUrls: ['./ingester.css']
})
export class IngesterComponent implements OnInit {
  // Mode toggle: 'repo' (primary) or 'manual' (fallback)
  inputMode: 'repo' | 'manual' = 'repo';

  // Repo mode fields
  repoUrl: string = '';
  commits: CommitInfo[] = [];
  selectedCommit: CommitInfo | null = null;
  isFetchingCommits: boolean = false;
  fetchError: string = '';
  currentPage: number = 1;
  hasMoreCommits: boolean = true;

  // Manual mode / shared fields
  githubUrl: string = '';
  aiChatLog: string = '';

  // State variables for the UI
  isLoading: boolean = false;
  successData: any = null;
  errorMessage: string = '';

  // Saved Repositories
  savedRepos: string[] = [];

  constructor(
    private apiService: ApiService,
    private analysisStateService: AnalysisStateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadSavedRepos();
  }

  /**
   * Load saved repos from local storage
   */
  loadSavedRepos() {
    const saved = localStorage.getItem('inctrl_saved_repos');
    if (saved) {
      this.savedRepos = JSON.parse(saved);
    }
  }

  /**
   * Save a repo URL to local storage
   */
  saveRepoUrl(url: string) {
    if (!url) return;
    const normalizedUrl = url.replace(/\/+$/, '');

    // Don't add duplicates
    if (!this.savedRepos.includes(normalizedUrl)) {
      // Add to beginning of array
      this.savedRepos.unshift(normalizedUrl);
      // Keep only the 10 most recent
      if (this.savedRepos.length > 10) {
        this.savedRepos.pop();
      }
      localStorage.setItem('inctrl_saved_repos', JSON.stringify(this.savedRepos));
    }
  }

  /**
   * Populate from saved repo list
   */
  useSavedRepo(url: string) {
    this.repoUrl = url;
    this.inputMode = 'repo';
    this.fetchCommits();
  }

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
   * @param loadMore Whether to fetch the next page and append
   */
  fetchCommits(loadMore: boolean = false) {
    if (!this.repoUrl) {
      this.fetchError = 'Please enter a GitHub repository URL.';
      return;
    }

    this.isFetchingCommits = true;
    this.fetchError = '';

    if (!loadMore) {
      this.currentPage = 1;
      this.commits = [];
      this.selectedCommit = null;
    } else {
      this.currentPage++;
    }

    this.apiService.fetchCommits(this.repoUrl, this.currentPage).subscribe({
      next: (commits) => {
        this.isFetchingCommits = false;

        if (commits.length < 10) {
          this.hasMoreCommits = false;
        } else {
          this.hasMoreCommits = true;
        }

        if (loadMore) {
          this.commits = [...this.commits, ...commits];
        } else {
          this.commits = commits;
        }

        // Save to local storage on success
        this.saveRepoUrl(this.repoUrl);
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
          const parsedAnalysis = JSON.parse(response.analysis) as AiAnalysis;

          // Pass data to state service and navigate
          this.analysisStateService.setAnalysis({
            parsedData: parsedAnalysis,
            commitUrl: commitUrl,
            repoUrl: this.repoUrl
          });

          this.router.navigate(['/results']);

        } catch (e) {
          console.error("Failed to parse Gemini JSON", e);
          this.errorMessage = "Failed to parse the AI analysis response.";
          this.cdr.detectChanges();
        }

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
