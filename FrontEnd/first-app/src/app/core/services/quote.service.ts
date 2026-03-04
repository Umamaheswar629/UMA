import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { QuoteRequest, QuoteResponse } from '../models/quote.model';

@Injectable({
    providedIn: 'root'
})
export class QuoteService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/Quotes';

    generateQuote(req: QuoteRequest): Observable<ApiResponse<QuoteResponse>> {
        return this.http.post<ApiResponse<QuoteResponse>>(`${this.API_URL}`, req);
    }

    getQuoteById(id: number | string): Observable<ApiResponse<QuoteResponse>> {
        return this.http.get<ApiResponse<QuoteResponse>>(`${this.API_URL}/${id}`);
    }

    getMyQuotes(): Observable<ApiResponse<QuoteResponse[]>> {
        return this.http.get<ApiResponse<QuoteResponse[]>>(`${this.API_URL}/my`);
    }
}
