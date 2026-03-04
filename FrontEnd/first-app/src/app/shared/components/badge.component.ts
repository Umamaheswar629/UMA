import { Component, Input, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './badge.component.html'
})
export class BadgeComponent implements OnChanges {
    @Input() status: string = '';

    statusSignal = signal<string>('');

    ngOnChanges(changes: SimpleChanges) {
        if (changes['status']) {
            this.statusSignal.set(this.status);
        }
    }

    colorClasses = computed(() => {
        const s = this.statusSignal().toLowerCase();
        if (['active', 'approved', 'settled'].includes(s)) {
            return 'bg-green-100 text-green-800';
        }
        if (['cancelled', 'rejected'].includes(s)) {
            return 'bg-red-100 text-red-800';
        }
        if (['pending', 'submitted', 'pendingapproval', 'pendingrenewal'].includes(s.replace(/\s+/g, ''))) {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (['underreview'].includes(s.replace(/\s+/g, ''))) {
            return 'bg-blue-100 text-blue-800';
        }
        if (['expired'].includes(s)) {
            return 'bg-gray-100 text-gray-800';
        }
        return 'bg-gray-100 text-gray-800'; // default
    });
}
