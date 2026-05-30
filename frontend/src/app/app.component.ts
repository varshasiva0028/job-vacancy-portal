import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DashboardComponent } from './pages/dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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

  constructor(private http: HttpClient) {}

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