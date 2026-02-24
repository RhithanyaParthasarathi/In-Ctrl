import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IngesterComponent } from './components/ingester/ingester';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IngesterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
