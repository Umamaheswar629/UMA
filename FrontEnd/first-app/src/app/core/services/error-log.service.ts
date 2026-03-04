import { Injectable, signal } from '@angular/core';

export interface ErrorLogEntry {
    id: number;
    timestamp: Date;
    status: number;
    method: string;
    url: string;
    message: string;
    detail?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorLogService {
    private nextId = 1;
    errors = signal<ErrorLogEntry[]>([]);

    addError(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>) {
        const newEntry: ErrorLogEntry = {
            ...entry,
            id: this.nextId++,
            timestamp: new Date()
        };
        this.errors.update(list => [newEntry, ...list].slice(0, 100)); // keep last 100
    }

    clearErrors() {
        this.errors.set([]);
    }

    errorCount() {
        return this.errors().length;
    }
}
