import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progression',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progression.html',
  styleUrls: ['./progression.css']
})
export class ProgressionComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 5;
  @Input() steps: string[] = [
    'Recherche',
    'Vols',
    'Voyageurs',
    'Paiement',
    'Confirmation'
  ];

  getStepClass(step: number): string {
    if (step < this.currentStep) {
      return 'completed';
    } else if (step === this.currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  }
}
