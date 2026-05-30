import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterPipe } from '../../pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  applicants: any[] = [];
  searchText: string = '';
  editingId: number | null = null;
  editData: any = {};
  
  editResumeFile: File | null = null;
  editMarksheetFile: File | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApplicants();
  }

  loadApplicants(): void {
    this.http.get<any[]>('http://localhost:8081/api/applicants')
      .subscribe(data => {
        this.applicants = [...data];
        this.cdr.detectChanges();
      });
  }

  startEdit(applicant: any): void {
    this.editingId = applicant.id;
    this.editData = { ...applicant };
    this.editResumeFile = null;
    this.editMarksheetFile = null;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editData = {};
    this.editResumeFile = null;
    this.editMarksheetFile = null;
  }

  onEditResumeSelect(event: any): void {
    this.editResumeFile = event.target.files[0];
  }

  onEditMarksheetSelect(event: any): void {
    this.editMarksheetFile = event.target.files[0];
  }

  saveEdit(): void {
    if (!this.editData.name || !this.editData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.editData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(this.editData.phone)) {
      alert('Phone number must contain exactly 10 digits');
      return;
    }

    const qualificationPattern = /^[A-Za-z\s]+$/;
    if (!qualificationPattern.test(this.editData.qualification)) {
      alert('Qualification should contain only letters');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.editData.name.trim());
    formData.append('email', this.editData.email.trim());
    formData.append('phone', this.editData.phone.trim());
    formData.append('qualification', this.editData.qualification.trim());

    if (this.editResumeFile) {
      formData.append('resume', this.editResumeFile);
    }
    if (this.editMarksheetFile) {
      formData.append('marksheet', this.editMarksheetFile);
    }

    this.http.put(
      'http://localhost:8081/api/applicants/' + this.editingId,
      formData,
      { responseType: 'text' }
    ).subscribe({
      next: (response: string) => {
        alert(response);
        this.loadApplicants();
        this.cancelEdit();
      },
      error: (error: any) => {
        console.error(error);
        alert('Failed to update applicant');
      }
    });
  }
}