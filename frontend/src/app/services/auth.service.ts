import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth'; // Adres Twojego Backendu

  constructor(private http: HttpClient) { }

  // Logowanie
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, loginData).pipe(
      tap(response => {
        if (response.token) {
          // Zapisz token w pamięci przeglądarki
          localStorage.setItem('token', response.token);
          // Zapisz też username, przyda się do wyświetlania "Witaj Tomek"
          localStorage.setItem('username', loginData.username);
        }
      })
    );
  }

  // Rejestracja
  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  // Wylogowanie
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  // Sprawdzenie czy użytkownik jest zalogowany
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Pobranie tokena (do późniejszych zapytań)
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}