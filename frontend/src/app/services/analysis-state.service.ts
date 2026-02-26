import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AnalysisStateService {
    private analysisData: any = null;

    setAnalysis(data: any) {
        this.analysisData = data;
    }

    getAnalysis() {
        return this.analysisData;
    }

    clearAnalysis() {
        this.analysisData = null;
    }
}
