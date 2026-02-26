import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, AuditedCommit, AiAnalysis } from '../../services/api';
import { AnalysisStateService } from '../../services/analysis-state.service';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './history.html',
    styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {
    auditedCommits: AuditedCommit[] = [];
    repositories: string[] = [];
    searchQuery: string = '';
    selectedRepo: string = 'All';
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor(
        private apiService: ApiService,
        private stateService: AnalysisStateService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.fetchHistory();
    }

    fetchHistory(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.apiService.getHistory().subscribe({
            next: (commits) => {
                this.auditedCommits = commits;
                this.extractRepositories();
                this.isLoading = false;
                this.cdr.detectChanges(); // Force UI update
            },
            error: (err: any) => {
                this.errorMessage = 'Failed to load saved history. Please ensure the backend is running.';
                this.isLoading = false;
                this.cdr.detectChanges(); // Force UI update
                console.error(err);
            }
        });
    }

    /**
     * Extracts unique repository URLs to populate the filter dropdown
     */
    extractRepositories(): void {
        const repos = new Set<string>();
        this.auditedCommits.forEach(c => repos.add(c.repoUrl));
        this.repositories = Array.from(repos);
    }

    /**
     * Dynamically filters the commits based on the selected repo and search query
     */
    get filteredCommits(): AuditedCommit[] {
        let filtered = this.auditedCommits;

        // Filter by Repository
        if (this.selectedRepo !== 'All') {
            filtered = filtered.filter(c => c.repoUrl === this.selectedRepo);
        }

        // Filter by Search Query
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            const lowerQuery = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c => {
                const matchSha = c.commitSha.toLowerCase().includes(lowerQuery);
                const matchTag = c.tag && c.tag.toLowerCase().includes(lowerQuery);
                const matchSummary = this.getPreviewSummary(c.analysisJson).toLowerCase().includes(lowerQuery);
                return matchSha || matchTag || matchSummary;
            });
        }

        return filtered;
    }

    /**
     * Parses the JSON summary from the raw analysis string just for the card preview
     */
    getPreviewSummary(jsonString: string): string {
        try {
            const parsed = JSON.parse(jsonString) as AiAnalysis;
            const text = parsed.summary || 'No summary available.';
            return text.length > 120 ? text.substring(0, 120) + '...' : text;
        } catch (e) {
            return 'Encrypted or invalid analysis format.';
        }
    }

    /**
     * Formats the database timestamp
     */
    formatDate(dateString: string): string {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Extract the repo name from the full URL
     */
    getRepoName(url: string): string {
        if (!url) return 'Unknown Repo';
        return url.replace('https://github.com/', '').replace(/\.git$/, '');
    }

    /**
     * Loads the saved analysis into state and navigates to the results page
     */
    openCommit(commit: AuditedCommit): void {
        try {
            const parsedAnalysis = JSON.parse(commit.analysisJson) as AiAnalysis;

            this.stateService.setAnalysis({
                parsedData: parsedAnalysis,
                commitUrl: `${commit.repoUrl}/commit/${commit.commitSha}`,
                repoUrl: commit.repoUrl
            });

            this.router.navigate(['/results']);
        } catch (e) {
            this.errorMessage = "Failed to parse the saved analysis data.";
        }
    }
}
