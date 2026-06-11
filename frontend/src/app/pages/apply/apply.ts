import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ElementRef, HostListener } from '@angular/core';

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
    qualification: '',
    gender: '',
    languages: [] as string[]
  };
  companyNames = [
    'Google',
    'Microsoft',
    'Amazon',
    'Apple',
    'Meta',
    'Netflix',
    'IBM',
    'Infosys',
    'TCS',
    'Wipro'
  ];

  selectedCompanies: string[] = [];

  showCompanies = false;
  languageGroups = [
    {
      label: 'Indian Languages',
      options: [
        'Tamil',
        'Telugu',
        'Hindi',
        'Malayalam',
        'Kannada',
        'Bengali',
        'Marathi',
        'Gujarati',
        'Punjabi',
        'Odia'
      ]
    },
    {
      label: 'Foreign Languages',
      options: [
        'English',
        'Japanese',
        'French',
        'German',
        'Spanish',
        'Chinese',
        'Korean',
        'Russian',
        'Italian',
        'Arabic'
      ]
    }
  ];

  selectedLanguageNames: string[] = [];
  selectedLanguages: Array<{
    name: string;
    read: boolean;
    write: boolean;
    speak: boolean;
    all: boolean;
  }> = [];

  resumeFile: File | null = null;
  marksheetFile: File | null = null;
  photoFile: File | null = null;
  submitted = false;
  loading = false;
  constructor(private http: HttpClient) { }
  onResumeSelect(event: any) {
    this.resumeFile = event.target.files[0];
  }
  onMarksheetSelect(event: any) {
    this.marksheetFile = event.target.files[0];
  }

  onPhotoSelect(event: any) {
    this.photoFile = event.target.files[0];
  }
  createLanguageSkill(name: string) {
    return {
      name,
      read: false,
      write: false,
      speak: false,
      all: false
    };
  }

  addLanguage(name: string): void {
    if (!this.selectedLanguages.some(lang => lang.name === name)) {
      this.selectedLanguages.push(
        this.createLanguageSkill(name)
      );
    }

    if (!this.selectedLanguageNames.includes(name)) {
      this.selectedLanguageNames.push(name);
    }
  }
  showLanguages = false;
  toggleLanguage(language: string, event: any): void {

    if (event.target.checked) {

      this.addLanguage(language);

      if (!this.selectedLanguageNames.includes(language)) {
        this.selectedLanguageNames.push(language);
      }

    } else {

      this.removeLanguage(language);

    }

  }

  removeLanguage(name: string): void {
    this.selectedLanguages = this.selectedLanguages.filter(
      lang => lang.name !== name
    );
    this.selectedLanguageNames = this.selectedLanguageNames.filter(
      item => item !== name
    );
  }

  syncSelectedLanguages(names: string[]): void {
    const removed = this.selectedLanguages
      .map(lang => lang.name)
      .filter(name => !names.includes(name));

    removed.forEach(name => this.removeLanguage(name));

    names.forEach(name => {
      if (!this.selectedLanguages.some(lang => lang.name === name)) {
        this.addLanguage(name);
      }
    });
  }

  toggleAll(language: any): void {
    if (language.all) {
      language.read = true;
      language.write = true;
      language.speak = true;
    } else {
      language.read = false;
      language.write = false;
      language.speak = false;
    }
  }

  updateLanguageAllState(language: any): void {
    language.all = language.read && language.write && language.speak;
  }

  getProgress(language: any): number {
    if (language.all) {
      return 100;
    }

    let progress = 0;
    if (language.read) {
      progress += 30;
    }
    if (language.write) {
      progress += 30;
    }
    if (language.speak) {
      progress += 40;
    }
    return progress;
  }
  toggleCompany(company: string, event: any): void {

    if (event.target.checked) {

      if (!this.selectedCompanies.includes(company)) {
        this.selectedCompanies.push(company);
      }

    } else {

      this.selectedCompanies =
        this.selectedCompanies.filter(x => x !== company);

    }

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
    if (!this.applicant.gender) {
      alert("Please select Gender");
      return;
    }

    if (this.selectedLanguages.length === 0) {
      alert("Please select Language Known");
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
    formData.append(
      'gender',
      this.applicant.gender
    );

    formData.append(
      'languages',
      JSON.stringify(this.selectedLanguages)
    );
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
          qualification: '',
          gender: '',
          languages: []
        };
        this.selectedLanguageNames = [];
        this.selectedLanguages = [];
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