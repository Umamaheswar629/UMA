import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
    @Input() title: string = '';
    @Input() value: string | number = '';
    @Input() subtitle?: string;
    @Input() colorClass: string = 'bg-blue-600';
}
