import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'apezzi';
  categories = ['🍽️', '🥐', '🛒', '🚂', '🎟️', '🏨', '🧽', '🚗', '🧴', '🪑'];
  selectedCategory = 0;
  selectCategory(index: number) {
    this.selectedCategory = index;
  }
  splits = [50, 100, 0, 70, 30];
  selectedSplit = 0;
  selectSplit(index: number) {
    this.selectedSplit = index;
  }
}
