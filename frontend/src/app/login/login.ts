import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardComponent
  ],
  templateUrl: './login.html',
styleUrls: ['./login.css']
})
export class LoginComponent{
  applicant = {
    name: '',
    email: '',
    phone: '',
    qualification: ''
  };

  resumeFile: File | null = null;
  marksheetFile: File | null = null;
  submitted = false;
  showDashboard = false;

  // Auth & Registration variables
  isLoggedIn = false;
  isRegisterMode = false;
  
  loginInput = {
    usernameOrEmail: '',
    password: ''
  };
  loginError = '';

  registerInput = {
    usernameOrEmail: '',
    password: '',
    confirmPassword: ''
  };

  registeredUsers = [
    { usernameOrEmail: 'admin@portal.com', password: 'password123' },
    { usernameOrEmail: 'admin', password: 'password123' },
    { usernameOrEmail: 'user@portal.com', password: 'password123' },
    { usernameOrEmail: 'user', password: 'password123' }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  login(): void {
    const email = this.loginInput.usernameOrEmail.trim().toLowerCase();
    const password = this.loginInput.password;

    if (!email) {
      alert('Please enter your Username or Email ID');
      return;
    }

    if (!password) {
      alert('Please enter your Password');
      return;
    }

    // Dynamic credentials check
    const matchedUser = this.registeredUsers.find(
      u => u.usernameOrEmail.trim().toLowerCase() === email && u.password === password
    );

    if (matchedUser) {
  this.isLoggedIn = true;
  this.loginError = '';

  alert('Login Successful!');

  this.router.navigate([1, 'dashboard']);
} else {
      this.loginError = 'Invalid username/email or password';
      alert('Invalid username/email or password!');
    }
  }

  register(): void {
    const email = this.registerInput.usernameOrEmail.trim().toLowerCase();
    const password = this.registerInput.password;
    const confirmPassword = this.registerInput.confirmPassword;

    if (!email) {
      alert('Please enter a Username or Email ID');
      return;
    }

    if (!password) {
      alert('Please enter a Password');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Check if user already exists
    const userExists = this.registeredUsers.some(
      u => u.usernameOrEmail.trim().toLowerCase() === email
    );

    if (userExists) {
      alert('This username/email is already registered!');
      return;
    }

    // Register user
    this.registeredUsers.push({ usernameOrEmail: email, password: password });
    
    alert('Registration Successful! Redirecting to login...');
    
    // Clear inputs and toggle back to login mode
    this.registerInput = {
      usernameOrEmail: '',
      password: '',
      confirmPassword: ''
    };
    this.isRegisterMode = false;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loginInput = {
      usernameOrEmail: '',
      password: ''
    };
    this.loginError = '';
    alert('Logged out successfully');
  }

  onResumeSelect(event: any): void {
    this.resumeFile = event.target.files[0];
  }

  onMarksheetSelect(event: any): void {
    this.marksheetFile = event.target.files[0];
  }

  submitForm(): void {

    if (!this.applicant.name.trim()) {
      alert('Please enter your name');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.applicant.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(this.applicant.phone)) {
      alert('Phone number must contain exactly 10 digits');
      return;
    }

    const qualificationPattern = /^[A-Za-z\s]+$/;

    if (!qualificationPattern.test(this.applicant.qualification)) {
      alert('Qualification should contain only letters');
      return;
    }

    if (!this.resumeFile || !this.marksheetFile) {
      alert('Please upload Resume and Marksheet');
      return;
    }

    const formData = new FormData();

    formData.append('name', this.applicant.name);
    formData.append('email', this.applicant.email);
    formData.append('phone', this.applicant.phone);
    formData.append('qualification', this.applicant.qualification);
    formData.append('resume', this.resumeFile);
    formData.append('marksheet', this.marksheetFile);

    this.http.post(
      'http://localhost:8081/api/applicants',
      formData,
      { responseType: 'text' }
    ).subscribe({
      next: (response: string) => {

        console.log(response);

        this.submitted = true;

        alert('Application Submitted Successfully');

        this.applicant = {
          name: '',
          email: '',
          phone: '',
          qualification: ''
        };

        this.resumeFile = null;
        this.marksheetFile = null;
      },

      error: (error: any) => {

        console.error(error);

        alert('Submission Failed');
      }
    });
  }

  downloadForm(): void {

    const data = `
Job Application Form

Name: ${this.applicant.name}
Email: ${this.applicant.email}
Phone: ${this.applicant.phone}
Qualification: ${this.applicant.qualification}
`;

    const blob = new Blob([data], {
      type: 'text/plain'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'application.txt';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}