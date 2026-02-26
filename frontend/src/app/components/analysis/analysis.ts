import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnalysisStateService } from '../../services/analysis-state.service';
import { AiAnalysis, ChatMessage, ApiService, ChatRequest } from '../../services/api';
import { marked } from 'marked';

@Component({
    selector: 'app-analysis',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './analysis.html',
    styleUrls: ['./analysis.css']
})
export class AnalysisComponent implements OnInit {
    analysisData: any = null;
    analysis: AiAnalysis | null = null;
    commitUrl: string = '';
    repoUrl: string = '';
    commitSha: string = '';

    hasAcknowledged: boolean = false;
    alternativesNote: string = '';
    faultMitigations: string[] = [];

    // --- Chat State (Commit D & E) ---
    chatMessages: ChatMessage[] = [];
    currentQuestion: string = '';
    isChatLoading: boolean = false;

    // --- Notes State (Commit F) ---
    commitNotes: string = '';
    isNotesSaving: boolean = false;
    notesSavedMessage: string = '';

    constructor(
        private stateService: AnalysisStateService,
        private apiService: ApiService,
        private router: Router
    ) { }

    ngOnInit() {
        this.analysisData = this.stateService.getAnalysis();

        if (this.analysisData && this.analysisData.parsedData) {
            this.analysis = this.analysisData.parsedData;
            this.commitUrl = this.analysisData.commitUrl;
            this.repoUrl = this.analysisData.repoUrl;

            // Extract SHA from URL (last part if direct commit URL)
            this.commitSha = this.commitUrl?.split('/').pop() || '';

            // Initialize array to match the number of faults
            this.faultMitigations = new Array(this.analysis?.faults?.length || 0).fill('');

            // Load persisted notes for this commit
            this.loadNotes();
        }
    }

    onAcknowledge() {
        this.hasAcknowledged = true;
    }

    // --- Chat Methods (Commit D & E) ---
    sendChatMessage() {
        const question = this.currentQuestion.trim();
        if (!question || this.isChatLoading) return;

        // Add user message to chat
        this.chatMessages.push({ role: 'user', content: question });
        this.currentQuestion = '';
        this.isChatLoading = true;

        const request: ChatRequest = {
            githubUrl: this.commitUrl,
            commitSha: this.commitSha,
            question: question,
            aiChatLog: this.analysisData?.parsedData?.summary || ''
        };

        this.apiService.chatAboutCommit(request).subscribe({
            next: (response) => {
                const renderedHtml = marked.parse(response.answer) as string;
                this.chatMessages.push({ role: 'ai', content: renderedHtml });
                this.isChatLoading = false;
            },
            error: (err) => {
                this.chatMessages.push({
                    role: 'ai',
                    content: `<p style="color: #f87171;">⚠️ Failed to get a response. Please try again.</p>`
                });
                this.isChatLoading = false;
            }
        });
    }

    onChatKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendChatMessage();
        }
    }

    // --- Notes Methods (Commit F) ---
    loadNotes() {
        if (!this.commitSha) return;
        this.apiService.getNote(this.commitSha).subscribe({
            next: (note) => { this.commitNotes = note?.content || ''; },
            error: () => { /* Note doesn't exist yet - that's fine */ }
        });
    }

    saveNotes() {
        if (!this.commitSha) return;
        this.isNotesSaving = true;
        this.notesSavedMessage = '';

        this.apiService.saveNote(this.commitSha, this.commitNotes).subscribe({
            next: () => {
                this.isNotesSaving = false;
                this.notesSavedMessage = '✅ Notes saved!';
                setTimeout(() => { this.notesSavedMessage = ''; }, 3000);
            },
            error: () => {
                this.isNotesSaving = false;
                this.notesSavedMessage = '⚠️ Failed to save notes.';
            }
        });
    }
}
