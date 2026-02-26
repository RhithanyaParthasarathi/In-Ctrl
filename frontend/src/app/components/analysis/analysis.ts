import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

    // --- Tab State ---
    activeTab: 'summary' | 'alternatives' | 'faults' = 'summary';

    // --- Chat State (Commit D & E) ---
    chatMessages: ChatMessage[] = [];
    currentQuestion: string = '';
    isChatLoading: boolean = false;

    // --- Notes State (Commit F) ---
    parsedNotes: { title?: string, content: string }[] = [];
    isNoteInputExpanded: boolean = false;
    newNoteTitle: string = '';
    newNoteContent: string = '';
    expandedNoteIndex: number | null = null;

    commitNotes: string = '';
    isNotesSaving: boolean = false;
    notesSavedMessage: string = '';

    // --- History Tagging ---
    commitTag: string = '';
    isTagSaving: boolean = false;
    tagSavedMessage: string = '';
    rawAnalysisJson: string = '';
    showTagModal: boolean = false;

    constructor(
        private stateService: AnalysisStateService,
        private apiService: ApiService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer
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

    // --- Tab Methods ---
    setActiveTab(tab: 'summary' | 'alternatives' | 'faults') {
        this.activeTab = tab;

        // Auto-load notes for the specific section when switching tabs
        this.loadNotes(tab);
    }

    // --- Chat Methods (Commit D & E) ---
    sendChatMessage() {
        const question = this.currentQuestion.trim();
        if (!question || this.isChatLoading) return;

        // Add user message to chat
        this.chatMessages.push({ role: 'user', content: question });
        this.currentQuestion = '';
        this.isChatLoading = true;

        // Sanitize the AI chat log to prevent JSON parsing errors in the backend
        const rawSummary = this.analysisData?.parsedData?.summary || '';
        const safeAiChatLog = rawSummary.replace(/["\\]/g, ''); // strip quotes and backslashes

        const request: ChatRequest = {
            githubUrl: this.commitUrl,
            commitSha: this.commitSha,
            question: question,
            aiChatLog: '' // Keep empty to avoid JSON parse errors from embedded special chars
        };

        this.apiService.chatAboutCommit(request).subscribe({
            next: (response) => {
                const rawHtml = marked.parse(response.answer) as string;
                const safeHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
                this.chatMessages.push({ role: 'ai', content: safeHtml as string });
                this.isChatLoading = false;
            },
            error: (err: any) => {
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
        if (!this.commitSha) return;
        this.apiService.getNote(this.commitSha, section).subscribe({
            next: (note) => {
                const rawContent = note?.content || '';
                this.commitNotes = rawContent;
                try {
                    this.parsedNotes = JSON.parse(rawContent) || [];
                } catch (e) {
                    // Backwards compatibility for plain text notes
                    if (rawContent.trim()) {
                        this.parsedNotes = [{ content: rawContent }];
                    } else {
                        this.parsedNotes = [];
                    }
                }
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.parsedNotes = [];
                this.cdr.detectChanges();
                console.log("loadNotes error (expected if new note):", err);
            }
        });
    }

    saveNotes(section: string = 'summary') {
        if (!this.commitSha) {
            this.notesSavedMessage = '⚠️ Error: Missing Commit SHA';
            this.cdr.detectChanges();
            return;
        }

        // Serialize parsedNotes to JSON
        this.commitNotes = JSON.stringify(this.parsedNotes);

        this.isNotesSaving = true;
        this.notesSavedMessage = 'Saving...';
        this.cdr.detectChanges();

        this.apiService.saveNote(this.commitSha, this.commitNotes, section).subscribe({
            next: (res) => {
                this.isNotesSaving = false;
                this.notesSavedMessage = '✅ Saved';
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.notesSavedMessage = '';
                    this.cdr.detectChanges();
                }, 3000);
            },
            error: (err: any) => {
                this.isNotesSaving = false;
                this.notesSavedMessage = '⚠️ Failed: ' + (err.message || 'Server error');
                this.cdr.detectChanges();
            }
        });
    }

    addNote() {
        if (!this.newNoteContent.trim() && !this.newNoteTitle.trim()) {
            this.isNoteInputExpanded = false;
            return;
        }

        this.parsedNotes.unshift({
            title: this.newNoteTitle,
            content: this.newNoteContent
        });

        // Reset inputs
        this.newNoteTitle = '';
        this.newNoteContent = '';
        this.isNoteInputExpanded = false;

        // Auto-save
        this.saveNotes(this.activeTab);
    }

    deleteNote(index: number, event?: Event) {
        if (event) event.stopPropagation();
        this.parsedNotes.splice(index, 1);
        this.saveNotes(this.activeTab);
    }

    openNoteForViewing(index: number) {
        this.expandedNoteIndex = index;
    }

    closeNoteViewing() {
        this.expandedNoteIndex = null;
    }

    deleteNoteFromView(index: number) {
        this.deleteNote(index);
        this.closeNoteViewing();
    }

    // --- Tag Saving ---
    openTagModal() {
        this.showTagModal = true;
        this.tagSavedMessage = '';
    }

    closeTagModal() {
        this.showTagModal = false;
    }

    saveCommitTag() {
        if (!this.commitTag.trim()) return;

        this.isTagSaving = true;
        this.tagSavedMessage = 'Saving...';
        this.cdr.detectChanges();

        const onSuccess = () => {
            this.isTagSaving = false;
            this.tagSavedMessage = '✅ Tag Saved!';
            this.cdr.detectChanges();
            setTimeout(() => {
                this.showTagModal = false;
                this.tagSavedMessage = '';
                this.cdr.detectChanges();
            }, 1500);
        };

        const onError = (err: any) => {
            this.isTagSaving = false;
            this.tagSavedMessage = '⚠️ Failed to save tag';
            this.cdr.detectChanges();
            console.error('Failed to save tag', err);
        };

        // Try fast PATCH first; fall back to full POST if PATCH fails (e.g. record not yet saved)
        this.apiService.updateTag(this.commitSha, this.commitTag).subscribe({
            next: onSuccess,
            error: () => {
                const historyPayload = {
                    commitSha: this.commitSha,
                    repoUrl: this.repoUrl,
                    analysisJson: this.rawAnalysisJson,
                    tag: this.commitTag
                };
                this.apiService.saveHistory(historyPayload).subscribe({ next: onSuccess, error: onError });
            }
        });
    }
}
