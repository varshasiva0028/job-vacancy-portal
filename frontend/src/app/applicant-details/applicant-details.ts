import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-applicant-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicant-details.html',
  styleUrls: ['./applicant-details.css']
})
export class ApplicantDetailsComponent {

  @Input() applicant: any;

  @Output() back = new EventEmitter<void>();

  constructor(){
    // alert(this.applicant+'ab');
  }

  goBack(): void {
    this.back.emit();
  }

  getLanguages(): string[] {

    if (!this.applicant?.languages) {
      return [];
    }

    try {
      const languages = JSON.parse(this.applicant.languages);
      return languages.map((lang: any) => lang.name);
    } catch {
      return this.applicant.languages
        .split(',')
        .map((lang: string) => lang.trim())
        .filter((lang: string) => lang);
    }
  }

  getCompanies(): string[] {

    if (!this.applicant?.companies) {
      return [];
    }

    try {
      return JSON.parse(this.applicant.companies);
    } catch {
      return this.applicant.companies
        .split(',')
        .map((company: string) => company.trim())
        .filter((company: string) => company);
    }
  }

  getPhotos(): string[] {

    if (!this.applicant?.photoPaths) {
      return [];
    }

    return this.applicant.photoPaths
      .split(',')
      .map((photo: string) => photo.trim())
      .filter((photo: string) => photo);
  }
}