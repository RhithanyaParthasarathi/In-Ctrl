import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnalysisStateService } from '../../services/analysis-state.service';
import { AiAnalysis } from '../../services/api';

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

    hasAcknowledged: boolean = false;
    alternativesNote: string = '';
    faultMitigations: string[] = [];

    constructor(
        private stateService: AnalysisStateService,
        private router: Router
    ) { }

    ngOnInit() {
        this.analysisData = this.stateService.getAnalysis();

        if (this.analysisData && this.analysisData.parsedData) {
            this.analysis = this.analysisData.parsedData;
            this.commitUrl = this.analysisData.commitUrl;
            this.repoUrl = this.analysisData.repoUrl;

            // Initialize array to match the number of faults
            this.faultMitigations = new Array(this.analysis?.faults?.length || 0).fill('');
        }
    }

    onAcknowledge() {
        this.hasAcknowledged = true;
    }
}
