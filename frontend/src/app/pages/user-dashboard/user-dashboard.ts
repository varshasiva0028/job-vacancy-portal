import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,

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
  selector: 'app-user-dashboard',
  standalone: true,
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
        'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada',
        'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia'
      ]
    },
    {
      label: 'Foreign Languages',
      options: [
        'English', 'Japanese', 'French', 'German',
        'Spanish', 'Chinese', 'Korean', 'Russian',
        'Italian', 'Arabic'
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
    )
      .subscribe({

        next: (response) => {

          console.log(response);

          this.applicant = { ...response };
          this.editApplicant = { ...response };

          this.cdr.detectChanges();

          console.log("applicant =", this.applicant);
          // Companies
          // Companies
          this.companies = [];

          if (response.companies) {

            try {

              this.companies = [...JSON.parse(response.companies)];

            } catch {

              this.companies = [];

            }

          }

          // Languages
          this.languages = [];

          if (response.languages) {

            try {

              this.languages = [...JSON.parse(response.languages)];

            } catch {

              this.languages = [];

            }
            this.cdr.detectChanges();

          }

          // Languages
          if (response.languages) {

            try {

              this.languages = JSON.parse(response.languages);

            }
            catch {

              this.languages = [];

            }

          }

        },

        error: (err) => {

          console.error(err);

        }

      });


  }
  editProfile(): void {

    this.editApplicant = { ...this.applicant };

    this.editLanguages =
      JSON.parse(JSON.stringify(this.languages));

    this.selectedLanguageNames =
      this.editLanguages.map(
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

  } toggleLanguage(language: string, event: any): void {

    if (event.target.checked) {

      this.addLanguage(language);

    }

    else {

      this.removeLanguage(language);

    }

  } updateLanguageAllState(language: any): void {

    language.all =

      language.read &&

      language.write &&

      language.speak;

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

onResumeSelected(event: any): void {

  if (event.target.files.length > 0) {

    this.selectedResume = event.target.files[0];

    this.resumeFileName =
      this.selectedResume!.name;

  }

}

onMarksheetSelected(event: any): void {

  if (event.target.files.length > 0) {

    this.selectedMarksheet =
      event.target.files[0];

    this.marksheetFileName =
      this.selectedMarksheet!.name;

  }

}
  saveChanges(): void {
    if (!this.editApplicant.name || !this.editApplicant.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!this.editApplicant.email || !this.editApplicant.email.trim()) {
      alert("Email is required");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.editApplicant.email.trim())) {
      alert("Invalid Email ID");
      return;
    }
    if (!this.editApplicant.qualification || !this.editApplicant.qualification.trim()) {
      alert("Qualification is required");
      return;
    }
    const textPattern = /^[A-Za-z\s]+$/;
    if (!textPattern.test(this.editApplicant.qualification.trim())) {
      alert("Qualification must contain only letters");
      return;
    }
    if (!this.editApplicant.gender) {
      alert("Please select Gender");
      return;
    }
    if (this.editLanguages.length === 0) {
      alert("Please select at least one Language Known");
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
    formData.append('name', this.editApplicant.name.trim());
    formData.append('email', this.editApplicant.email.trim());
    formData.append('phone', this.applicant.phone || '');
    formData.append('qualification', this.editApplicant.qualification.trim());
    formData.append('gender', this.editApplicant.gender);
    formData.append('languages', JSON.stringify(this.editLanguages));
    formData.append('companies', JSON.stringify(this.companies));

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.put(
      `http://localhost:8081/api/applicants/${this.applicant.id}`,
      formData,
      { headers, responseType: 'text' }
    ).subscribe({
      next: () => {

        alert("Applicant Updated Successfully");

        this.editMode = false;

        this.ngOnInit();

      },
      error: (err) => {
        console.error(err);
        alert("Update Failed: " + (err.error || err.message));
      }
    });
  }

  toggleAll(language: any): void {

    if (language.all) {

      language.read = true;
      language.write = true;
      language.speak = true;

    }

    else {

      language.read = false;
      language.write = false;
      language.speak = false;

    }

  }

  toggleCompany(company: string): void {

    if (this.companies.includes(company)) {

      this.companies =
        this.companies.filter(c => c !== company);

    }
    else {

      this.companies.push(company);

    }

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
  logout(): void {

    localStorage.clear();

    this.router.navigate(['/']);

  }

}