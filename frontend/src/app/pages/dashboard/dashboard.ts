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
//available languages
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
//selected languages for edit form
  selectedLanguageNames: string[] = [];
  selectedLanguages: Array<{
    name: string;
    read: boolean;
    write: boolean;
    speak: boolean;
    all: boolean;
  }> = [];

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
    this.selectedLanguages = this.parseStoredLanguages(applicant.languages);
    this.selectedLanguageNames = this.selectedLanguages.map(
      lang => lang.name
    );
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
    this.selectedLanguages = [];
    this.selectedLanguageNames = [];
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
//Creating a Language
  createLanguageSkill(name: string) {
    return {
      name,
      read: false,
      write: false,
      speak: false,
      all: false
    };
  }
//Adding a Language
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
//removing a Language
  removeLanguage(name: string): void {
    this.selectedLanguages = this.selectedLanguages.filter(
      lang => lang.name !== name
    );
    this.selectedLanguageNames = this.selectedLanguageNames.filter(
      existing => existing !== name
    );
  }
//Synchronizing Dropdown
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
//All Checkbox
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
//Updating All Automatically
  updateLanguageAllState(language: any): void {
    language.all = language.read && language.write && language.speak;
  }
//Progress Calculation
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

  private parseLanguageToken(token: string) {
    const trimmed = token.trim();
    const match = trimmed.match(/^(.+?)\s*\((.+)\)$/);
    const name = match ? match[1].trim() : trimmed;
    const skillText = match ? match[2] : '';
    const read = /read/i.test(skillText);
    const write = /write/i.test(skillText);
    const speak = /speak/i.test(skillText);
    const all = /all/i.test(skillText) || (read && write && speak);

    return {
      name,
      read,
      write,
      speak,
      all
    };
  }

  private parseStoredLanguages(value: string | null | undefined) {
    if (!value) {
      return [];
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    let parsed: any = null;
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = null;
      }
    }

    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => ({
          name: item?.name || '',
          read: !!item?.read,
          write: !!item?.write,
          speak: !!item?.speak,
          all: !!item?.all || (!!item?.read && !!item?.write && !!item?.speak)
        }))
        .filter((lang: any) => lang.name);
    }

    return trimmed
      .split(',')
      .map(token => this.parseLanguageToken(token))
      .filter(lang => lang.name);
  }

  getLanguageSummary(value: string): string {
    const parsed = this.parseStoredLanguages(value);
    return parsed.map(lang => lang.name).join(', ');
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

    if (this.selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return;
    }

    const formData = new FormData();

    formData.append('name', this.editData.name.trim());
    formData.append('email', this.editData.email.trim());
    formData.append('phone', this.editData.phone.trim());
    formData.append('qualification', this.editData.qualification.trim());
    formData.append('gender', this.editData.gender);
    formData.append(
      'languages',
      JSON.stringify(this.selectedLanguages)
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