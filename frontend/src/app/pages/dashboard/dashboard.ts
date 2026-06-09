import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FilterPipe } from '../../pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  languages = {
  english: {
    read: false,
    write: false,
    speak: false,
    all: false
  },

  french: {
    read: false,
    write: false,
    speak: false,
    all: false
  },

  japanese: {
    read: false,
    write: false,
    speak: false,
    all: false
  }
};
toggleAll(language: any) {

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
buildLanguageString(): string {

  const result: string[] = [];

  const processLanguage = (
    name: string,
    lang: any
  ) => {

    const skills: string[] = [];

    if (lang.read) skills.push('Read');
    if (lang.write) skills.push('Write');
    if (lang.speak) skills.push('Speak');

    if (skills.length > 0) {

      result.push(
        `${name} (${skills.join('/')})`
      );

    }

  };

  processLanguage(
    'English',
    this.languages.english
  );

  processLanguage(
    'French',
    this.languages.french
  );

  processLanguage(
    'Japanese',
    this.languages.japanese
  );

  return result.join(', ');
}

  applicants: any[] = [];
  searchText: string = '';
  viewMode: 'list' | 'grid' = 'list';

  toggleView(): void {
    this.viewMode =
      this.viewMode === 'list'
        ? 'grid'
        : 'list';
  }
  editingId: number | null = null;
  editData = {
    name: '',
    email: '',
    phone: '',
    qualification: '',
    gender: '',
    languages: ''
  };
  editResumeFile: File | null = null;
  editMarksheetFile: File | null = null;

  applicantId: number = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.applicantId = Number(params.get('id'));

      this.loadApplicants();
    });

  }

  loadApplicants(): void {

    this.http.get<any[]>('http://localhost:8081/api/applicants')
      .subscribe({
        next: (data) => {
          this.applicants = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading applicants:', error);
        }
      });

  }

  startEdit(applicant: any): void {

    this.editingId = applicant.id;

    this.editData = {
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      qualification: applicant.qualification,
      gender: applicant.gender,
      languages: applicant.languages
    };

   this.editResumeFile = null;
this.editMarksheetFile = null;

this.languages = {
  english: {
    read: false,
    write: false,
    speak: false,
    all: false
  },

  french: {
    read: false,
    write: false,
    speak: false,
    all: false
  },

  japanese: {
    read: false,
    write: false,
    speak: false,
    all: false
  }
};
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editData = {
      name: '',
      email: '',
      phone: '',
      qualification: '',
      gender: '',
      languages: ''
    };
    this.editResumeFile = null;
    this.editMarksheetFile = null;
  }

  onEditResumeSelect(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.editResumeFile = event.target.files[0];
    }
  }
  onEditMarksheetSelect(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.editMarksheetFile = event.target.files[0];
    }
  }
  onEditLanguageChange(event: any, language: string): void {

    let languages = this.editData.languages
      ? this.editData.languages.split(',')
      : [];

    if (event.target.checked) {

      if (!languages.includes(language)) {
        languages.push(language);
      }

    } else {

      languages = languages.filter(
        (l: string) => l !== language
      );

    }

    this.editData.languages = languages.join(',');
  }
  openEditModal(applicant: any): void {

    this.startEdit(applicant);

    const dialog =
      document.getElementById('editDialog') as HTMLDialogElement;

    if (dialog) {
      dialog.showModal();
    }
  }
  closeEditModal(): void {

    const dialog =
      document.getElementById('editDialog') as HTMLDialogElement;

    if (dialog) {
      dialog.close();
    }

    this.cancelEdit();
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

    const qualificationPattern = /^[A-Za-z\s.]+$/;
    if (!qualificationPattern.test(this.editData.qualification)) {
      alert('Qualification should contain only letters');
      return;
    }

    if (!this.editData.gender) {
      alert('Please select Gender');
      return;
    }

    if (
      this.buildLanguageString() === ''
    ) {
      alert(
        'Please select at least one language'
      );
      return;
    }

    const formData = new FormData();

    formData.append('name', this.editData.name.trim());
    formData.append('email', this.editData.email.trim());
    formData.append('phone', this.editData.phone.trim());
    formData.append('qualification', this.editData.qualification.trim());
    formData.append('gender', this.editData.gender);
    this.editData.languages =
  this.buildLanguageString();

formData.append(
  'languages',
  this.editData.languages
);
    if (this.editResumeFile) {
      formData.append('resume', this.editResumeFile);
    }

    if (this.editMarksheetFile) {
      formData.append('marksheet', this.editMarksheetFile);
    }

    this.http.put(
      `http://localhost:8081/api/applicants/${this.editingId}`,
      formData,
      { responseType: 'text' }
    ).subscribe({
      next: (response) => {
        alert(response);
        this.loadApplicants();
        this.closeEditModal();
      },
      error: (error) => {
        console.error(error);
        alert('Failed to update applicant');
      }
    });

  }
}