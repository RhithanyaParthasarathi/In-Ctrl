import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiAnalysis } from '../../services/api';

@Component({
    selector: 'app-audit-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './audit-dashboard.html',
    styleUrls: ['./audit-dashboard.css']
})
export class AuditDashboardComponent {
    @Input() analysis!: AiAnalysis;
    @Output() acknowledged = new EventEmitter<boolean>();

    hasAcknowledged: boolean = false;

    onAcknowledge() {
        this.hasAcknowledged = true;
        this.acknowledged.emit(true);
    }
}
