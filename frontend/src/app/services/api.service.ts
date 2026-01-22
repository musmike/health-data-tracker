import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestParameter, TestResult } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getParameters(): Observable<TestParameter[]> {
    return this.http.get<TestParameter[]>(`${this.apiUrl}/parameters`);
  }

  addParameter(param: TestParameter): Observable<TestParameter> {
    return this.http.post<TestParameter>(`${this.apiUrl}/parameters`, param);
  }

  getResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(`${this.apiUrl}/results`);
  }

  addResult(result: TestResult): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.apiUrl}/results`, result);
  }

  deleteParameter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parameters/${id}`);
  }

  updateParameter(id: number, param: TestParameter): Observable<TestParameter> {
    return this.http.put<TestParameter>(`${this.apiUrl}/parameters/${id}`, param);
  }

  deleteResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/results/${id}`);
  }

  updateResult(id: number, result: TestResult): Observable<TestResult> {
    return this.http.put<TestResult>(`${this.apiUrl}/results/${id}`, result);
  }
}