import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnChanges {
    @Input() currentPage: number = 1;
    @Input() totalPages: number = 1;
    @Output() pageChange = new EventEmitter<number>();

    currentPageSignal = signal<number>(1);
    totalPagesSignal = signal<number>(1);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentPage']) this.currentPageSignal.set(this.currentPage);
        if (changes['totalPages']) this.totalPagesSignal.set(this.totalPages);
    }

    visiblePages = computed(() => {
        const current = this.currentPageSignal();
        const total = this.totalPagesSignal();
        const maxVisible = 5;

        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;

        if (end > total) {
            end = total;
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    });

    onPrev() {
        if (this.currentPage > 1) {
            this.pageChange.emit(this.currentPage - 1);
        }
    }

    onNext() {
        if (this.currentPage < this.totalPages) {
            this.pageChange.emit(this.currentPage + 1);
        }
    }

    onPage(page: number) {
        if (page !== this.currentPage) {
            this.pageChange.emit(page);
        }
    }
}
