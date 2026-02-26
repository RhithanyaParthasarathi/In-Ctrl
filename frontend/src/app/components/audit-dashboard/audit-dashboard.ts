import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAnalysis } from '../../services/api';

@Component({
    selector: 'app-audit-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './audit-dashboard.html',
    styleUrls: ['./audit-dashboard.css']
})
export class AuditDashboardComponent implements OnInit {
    @Input() analysis!: AiAnalysis;
    @Output() acknowledged = new EventEmitter<boolean>();

    hasAcknowledged: boolean = false;

    // Task 1: Single notes area for alternatives
    alternativesNote: string = '';

    // Task 2: Fault mitigation plans for each fault
    faultMitigations: string[] = [];

    ngOnInit() {
        // Initialize array to match the number of faults
        if (this.analysis) {
            this.faultMitigations = new Array(this.analysis.faults?.length || 0).fill('');
        }
    }

    onAcknowledge() {
        this.hasAcknowledged = true;
        this.acknowledged.emit(true);
    }
}
