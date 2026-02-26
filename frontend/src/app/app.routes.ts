import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { IngesterComponent } from './components/ingester/ingester';
import { AnalysisComponent } from './components/analysis/analysis';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'analyze', component: IngesterComponent },
    { path: 'results', component: AnalysisComponent },
    { path: '**', redirectTo: '' }
];
