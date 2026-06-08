import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply.html',
  styleUrls: ['./apply.css']
})
export class ApplyComponent {
  applicant = {
    name: '',
    email: '',
    phone: '',
    qualification: ''
  };
  resumeFile: File | null = null;
  marksheetFile: File | null = null;
  photoFile: File | null = null;
  submitted = false;
  loading = false;
  constructor(private http: HttpClient) {}
  onResumeSelect(event: any) {
    this.resumeFile = event.target.files[0];
  }
  onMarksheetSelect(event: any) {
    this.marksheetFile = event.target.files[0];
  }
  onPhotoSelect(event: any) {
  this.photoFile = event.target.files[0];
}
  submitForm(form: NgForm) {
    if (form.invalid) {
      alert("Please fill all fields");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.applicant.email)) {
      alert("Invalid Email ID");
      return;
    }
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(this.applicant.phone)) {
      alert("Phone must be 10 digits");
      return;
    }
    const textPattern = /^[A-Za-z\s]+$/;
    if (!textPattern.test(this.applicant.qualification)) {
      alert("Qualification must contain only letters");
      return;
    }
   if (!this.resumeFile || !this.marksheetFile || !this.photoFile) {
  alert("Upload Resume, Photo and Marksheet");
  return;
}
    const formData = new FormData();
    formData.append('name', this.applicant.name);
    formData.append('email', this.applicant.email);
    formData.append('phone', this.applicant.phone);
    formData.append('qualification', this.applicant.qualification);
    formData.append('resume', this.resumeFile);
    formData.append('marksheet', this.marksheetFile);
    formData.append('photo', this.photoFile!);
    this.loading = true;
    this.http.post(
      'http://localhost:8081/api/applicants',
      formData,
      {
        observe: 'response',
        responseType: 'text'
      }
    ).subscribe({
      next: (response) => {
        console.log(response.body);
        this.loading = false;
        this.submitted = true;
        alert("Application Submitted Successfully");
        this.applicant = {
          name: '',
          email: '',
          phone: '',
          qualification: ''
        };
        this.resumeFile = null;
        this.marksheetFile = null;
        this.photoFile = null;
        form.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert("Submission Failed");
      }
    });
  }
  downloadForm() {
    const blob = new Blob(
      [JSON.stringify(this.applicant, null, 2)],
      { type: 'application/json' }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application.json';
    a.click();
  }
}