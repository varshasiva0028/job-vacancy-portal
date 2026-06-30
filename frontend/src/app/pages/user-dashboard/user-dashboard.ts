import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent implements OnInit {
  applicant: any = {};
  editApplicant: any = {};
  editMode = false;
  companies: string[] = [];
  languages: any[] = [];
  editLanguages: any[] = [];
  selectedPhoto: File | null = null;
  showPhotoDialog = false;
  photoList: string[] = [];
  selectedProfilePhoto = '';
  selectedLanguageNames: string[] = [];
  showLanguages = false;
  selectedResume: File | null = null;
  selectedMarksheet: File | null = null;
  resumeFileName = '';
  marksheetFileName = '';
  safePreviewUrl!: SafeResourceUrl;
  previewTitle = '';
  previewUrl = '';
  isPdf = false;
  @ViewChild('previewDialog')
  previewDialog!: ElementRef<HTMLDialogElement>;
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.get<any>(
      'http://localhost:8081/api/applicants/my',
      { headers }
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.applicant = { ...response };
        this.editApplicant = { ...response };
        this.cdr.detectChanges();
        console.log('applicant =', this.applicant);
        this.languages = [];
        if (response.languages) {
          try {
            this.languages = JSON.parse(response.languages);
          } catch {
            this.languages = [];
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/home']);
  }

  editProfile(): void {
    this.editApplicant = { ...this.applicant };
    this.editLanguages = JSON.parse(
      JSON.stringify(this.languages)
    );
    this.selectedLanguageNames = this.editLanguages.map(
      lang => lang.name
    );
    this.editMode = true;
  }
  cancelEdit(): void {
    this.editMode = false;
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
    if (!this.editLanguages.some(
      lang => lang.name === name
    )) {
      this.editLanguages.push(
        this.createLanguageSkill(name)
      );
    }
    if (!this.selectedLanguageNames.includes(name)) {
      this.selectedLanguageNames.push(name);
    }
  }

  toggleLanguage(language: string, event: any): void {
    event.target.checked ? this.addLanguage(language) : this.removeLanguage(language);
  }
  updateLanguageAllState(language: any): void {
    language.all =
      language.read &&
      language.write &&
      language.speak;
  }
  getProgress(language: any): number {
    return language.all ? 100 :
      (language.read ? 30 : 0) +
      (language.write ? 30 : 0) +
      (language.speak ? 40 : 0);
  }
  removeLanguage(name: string): void {

    this.editLanguages =
      this.editLanguages.filter(
        lang => lang.name !== name
      );

    this.selectedLanguageNames =
      this.selectedLanguageNames.filter(
        existing => existing !== name
      );

  }

  onPhotoSelected(event: any): void {

    if (event.target.files.length > 0) {

      this.selectedPhoto = event.target.files[0];

    }

  }
  onFileSelected(event: any, type: 'resume' | 'marksheet'): void {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === 'resume') {
      this.selectedResume = file;
      this.resumeFileName = file.name;
    } else {
      this.selectedMarksheet = file;
      this.marksheetFileName = file.name;
    }
  }
  saveChanges(): void {

    if (!this.editApplicant.name || !this.editApplicant.name.trim()) {

      alert('Name is required');
      return;

    }

    if (!this.editApplicant.email || !this.editApplicant.email.trim()) {

      alert('Email is required');
      return;

    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.editApplicant.email.trim())) {

      alert('Invalid Email ID');
      return;

    }

    if (
      !this.editApplicant.qualification ||
      !this.editApplicant.qualification.trim()
    ) {

      alert('Qualification is required');
      return;

    }

    const textPattern = /^[A-Za-z\s]+$/;

    if (!textPattern.test(this.editApplicant.qualification.trim())) {

      alert('Qualification must contain only letters');
      return;

    }

    if (!this.editApplicant.gender) {

      alert('Please select Gender');
      return;

    }

    if (this.editLanguages.length === 0) {

      alert('Please select at least one Language Known');
      return;

    }

    const formData = new FormData();

    if (this.selectedPhoto) {
      formData.append(
        'photo',
        this.selectedPhoto
      );

    }

    if (this.selectedResume) {
      formData.append(
        'resume',
        this.selectedResume
      );

    }

    if (this.selectedMarksheet) {

      formData.append(
        'marksheet',
        this.selectedMarksheet
      );

    }
    formData.append(
      'name',
      this.editApplicant.name.trim()
    );
    formData.append(
      'email',
      this.editApplicant.email.trim()
    );
    formData.append(
      'phone',
      this.applicant.phone || ''
    );
    formData.append(
      'qualification',
      this.editApplicant.qualification.trim()
    );
    formData.append(
      'dob',
      this.editApplicant.dob
    );
    formData.append(
      'gender',
      this.editApplicant.gender
    );
    formData.append(
      'languages',
      JSON.stringify(this.editLanguages)
    );
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.put(
      `http://localhost:8081/api/applicants/${this.applicant.id}`,
      formData,
      {
        headers,
        responseType: 'text'
      }
    ).subscribe({
      next: () => {
        alert('Applicant Updated Successfully');
        this.editMode = false;
        this.ngOnInit();
      },
      error: (err) => {
        console.error(err);
        alert(
          'Update Failed: ' +
          (err.error || err.message)
        );
      }
    });
  }
  toggleAll(language: any): void {
    language.read = language.write = language.speak = language.all;
  }
  openPreview(filePath: string, title: string): void {
    this.previewTitle = title;
    const fileUrl =
      'http://localhost:8081/uploads/' + filePath;
    this.safePreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl
      );
    this.isPdf = true;
  }
  closePreview(): void {
    this.isPdf = false;
    this.previewDialog.nativeElement.close();
  }
  openPhotoDialog(): void {
    this.photoList = this.applicant.photoPaths.split(',').filter((p: string) => p.trim());
    this.showPhotoDialog = true;
  }
  closePhotoDialog(): void {
    this.showPhotoDialog = false;
  }
  saveProfilePhoto(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.put(
      `http://localhost:8081/api/applicants/${this.applicant.id}/profile-photo`,
      {
        profilePhoto: this.selectedProfilePhoto
      },
      {
        headers,
        responseType: 'text'
      }
    ).subscribe({
      next: () => {
        this.applicant.profilePhoto =
          this.selectedProfilePhoto;
        this.closePhotoDialog();
        alert('Profile picture updated successfully');
      },
      error: err => {
        console.error(err);
        alert('Update failed');
      }
    });
  }
  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/', {
      replaceUrl: true
    });
  }
}