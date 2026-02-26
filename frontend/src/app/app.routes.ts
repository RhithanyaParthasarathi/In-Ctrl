import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { IngesterComponent } from './components/ingester/ingester';
import { AnalysisComponent } from './components/analysis/analysis';
import { HistoryComponent } from './components/history/history';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'analyze', component: IngesterComponent },
    { path: 'results', component: AnalysisComponent },
    { path: 'history', component: HistoryComponent },
    { path: '**', redirectTo: '' }
];
