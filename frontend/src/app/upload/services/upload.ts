import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirewallType } from '../enums/FirewallType.enum';
import { UploadResponse } from '../interfaces/upload.interfaces';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';


@Injectable({
  providedIn: 'root',
})
export class Upload {
  private apiUrl = 'http://localhost:3000/logs';
  

  constructor(private http: HttpClient) {}

  uploadLog(file: File, firewallType: FirewallType): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('firewallType', firewallType.toString()); 
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData)
    .pipe(catchError(this.handleError));;
  }

  getSupportedFirewallTypes(): Observable<FirewallType[]> {
    return this.http.get<FirewallType[]>(`${this.apiUrl}/supported-types`)
    .pipe(catchError(this.handleError));;
  }
  
  
  private handleError(error: any) {
    console.error('[LogsService]', error);
    return throwError(() =>
      new Error(error?.error?.message || 'Erreur serveur')
    );
  }
 
  
}
