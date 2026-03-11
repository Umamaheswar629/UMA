import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { NotificationDto } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/notifications';

    unreadCount = signal<number>(0);

    getNotifications(page: number, pageSize: number): Observable<ApiResponse<NotificationDto[]>> {
        const params = new HttpParams().set('page', page).set('pageSize', pageSize);
        return this.http.get<ApiResponse<NotificationDto[]>>(this.API_URL, { params });
    }

    getUnreadCount(): void {
        this.http.get<ApiResponse<number>>(`${this.API_URL}/unread-count`).subscribe(res => {
            if (res.success) {
                this.unreadCount.set(res.data);
            }
        });
    }

    markAsRead(id: number | string): Observable<ApiResponse<boolean>> {
        return this.http.patch<ApiResponse<boolean>>(`${this.API_URL}/${id}/read`, {});
    }

    markAllAsRead(): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.API_URL}/read-all`, {});
    }
}
