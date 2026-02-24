import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, IngestRequest, AiAnalysis } from '../../services/api';
import { AuditDashboardComponent } from '../audit-dashboard/audit-dashboard';

@Component({
  selector: 'app-ingester',
  standalone: true,
  imports: [CommonModule, FormsModule, AuditDashboardComponent],
  templateUrl: './ingester.html',
  styleUrls: ['./ingester.css']
})
export class IngesterComponent {
  // Data bound to the input fields in the HTML
  githubUrl: string = '';
  aiChatLog: string = '';

  // State variables for the UI
  isLoading: boolean = false;
  successData: any = null;
  errorMessage: string = '';

  // Feature B: Parsed AI Analysis Data
  aiAnalysis: AiAnalysis | null = null;
  isDashboardVisible: boolean = false;

  // Inject the ApiService and ChangeDetectorRef
  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Called when the user clicks the "Analyze Commit" button
   */
  onSubmit() {
    // Basic validation
    if (!this.githubUrl) {
      this.errorMessage = 'Please provide a GitHub Commit URL.';
      return;
    }

    // Prepare data and set loading state
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;
    this.aiAnalysis = null;
    this.isDashboardVisible = false;

    const request: IngestRequest = {
      githubUrl: this.githubUrl,
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
