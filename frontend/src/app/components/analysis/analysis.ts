import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

    // --- History Tagging ---
    commitTag: string = '';
    isTagSaving: boolean = false;
    tagSavedMessage: string = '';
    rawAnalysisJson: string = '';

    constructor(
        private stateService: AnalysisStateService,
        private apiService: ApiService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.analysisData = this.stateService.getAnalysis();

        if (this.analysisData && this.analysisData.parsedData) {
            this.analysis = this.analysisData.parsedData;
            this.commitUrl = this.analysisData.commitUrl;
            this.repoUrl = this.analysisData.repoUrl;

            // Extract SHA from URL (last part if direct commit URL)
            this.commitSha = this.commitUrl?.split('/').pop() || '';
            this.rawAnalysisJson = this.analysisData.rawJson || JSON.stringify(this.analysis);

            // Initialize array to match the number of faults
            this.faultMitigations = new Array(this.analysis?.faults?.length || 0).fill('');

            // Load persisted notes for this commit
            console.log("Analysis Component Init: commitSha IS: ", this.commitSha);
            this.loadNotes();
        } else {
            console.log("Analysis Component Init: NO ANALYSIS DATA FOUND!");
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
    loadNotes(section: string = 'summary') {
        console.log("loadNotes called for section:", section, "commitSha:", this.commitSha);
        if (!this.commitSha) return;
        this.apiService.getNote(this.commitSha, section).subscribe({
            next: (note) => {
                console.log("loadNotes success:", note);
                this.commitNotes = note?.content || '';
            },
            error: (err) => {
                console.log("loadNotes error (expected if new note):", err);
            }
        });
    }

    saveNotes(section: string = 'summary') {
        console.log("saveNotes CLICKED! commitSha:", this.commitSha, "content length:", this.commitNotes.length);
        if (!this.commitSha) {
            console.error("saveNotes FAILED: commitSha is falsy");
            this.notesSavedMessage = '⚠️ Error: Missing Commit SHA';
            this.cdr.detectChanges();
            return;
        }

        this.isNotesSaving = true;
        this.notesSavedMessage = 'Saving...';
        this.cdr.detectChanges();

        this.apiService.saveNote(this.commitSha, this.commitNotes, section).subscribe({
            next: (res) => {
                console.log("saveNotes API SUCCESS:", res);
                this.isNotesSaving = false;
                this.notesSavedMessage = '✅ Notes saved!';
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.notesSavedMessage = '';
                    this.cdr.detectChanges();
                }, 3000);
            },
            error: (err) => {
                console.error("saveNotes API ERROR:", err);
                this.isNotesSaving = false;
                this.notesSavedMessage = '⚠️ Failed: ' + (err.message || 'Server error');
                this.cdr.detectChanges();
            }
        });
    }

    // --- Tag Saving ---
    saveCommitTag() {
        if (!this.commitTag.trim()) return;

        this.isTagSaving = true;
        this.tagSavedMessage = 'Saving tag...';
        this.cdr.detectChanges();

        const historyPayload = {
            commitSha: this.commitSha,
            repoUrl: this.repoUrl,
            analysisJson: this.rawAnalysisJson,
            tag: this.commitTag
        };

        this.apiService.saveHistory(historyPayload).subscribe({
            next: () => {
                this.isTagSaving = false;
                this.tagSavedMessage = '✅ Tag Saved!';
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.tagSavedMessage = '';
                    this.cdr.detectChanges();
                }, 3000);
            },
            error: (err) => {
                this.isTagSaving = false;
                this.tagSavedMessage = '⚠️ Failed to save tag';
                this.cdr.detectChanges();
                console.error("Failed to save tag", err);
            }
        });
    }
}
