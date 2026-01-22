import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  globalError: string = ''; // Na błędy ogólne (np. serwer padł)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          alert('Rejestracja udana! Możesz się zalogować.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // TUTAJ JEST LOGIKA OBSŁUGI BŁĘDÓW Z BACKENDU
          if (err.status === 400) {
            const validationErrors = err.error; // To jest ta mapa {pole: "komunikat"}
            
            // Iterujemy po polach (username, password, email)
            Object.keys(validationErrors).forEach(key => {
              const control = this.registerForm.get(key);
              if (control) {
                // Ustawiamy błąd w kontrolce Angulara
                control.setErrors({ backend: validationErrors[key] });
              } else {
                // Jeśli błąd dotyczy czegoś innego (np. "error" z wyjątku ogólnego)
                this.globalError = validationErrors[key];
              }
            });
          } else {
            this.globalError = 'Wystąpił nieoczekiwany błąd.';
          }
        }
      });
    }
  }
}