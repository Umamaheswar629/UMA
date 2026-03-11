import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alert.component.html'
})
export class AlertComponent implements OnChanges {
    @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
    @Input() message: string = '';
    @Input() visible: boolean = false;
    @Output() dismissed = new EventEmitter<void>();

    typeSignal = signal<'success' | 'error' | 'warning' | 'info'>('info');

    ngOnChanges(changes: SimpleChanges) {
        if (changes['type']) {
            this.typeSignal.set(this.type);
        }
    }

    alertStyles = computed(() => {
        switch (this.typeSignal()) {
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-400',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-400',
                    buttonColor: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
                    svgPath: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />'
                };
            case 'error':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-400',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-400',
                    buttonColor: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
                    svgPath: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />'
                };
            case 'warning':
                return {
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-400',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-400',
                    buttonColor: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600',
                    svgPath: '<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />'
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-400',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-400',
                    buttonColor: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600',
                    svgPath: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />'
                };
        }
    });

    onDismiss() {
        this.dismissed.emit();
    }
}
