import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterPipe } from '../../pipe';
import { ApplicantDetailsComponent } from '../../applicant-details/applicant-details';
import { AdminAnalyticsComponent } from '../admin-analytics/admin-analytics';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterPipe,
    ApplicantDetailsComponent,
    AdminAnalyticsComponent,
    AdminSidebarComponent
  ],
  styleUrls: ['./admin.css'],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8081/api/applicants';
  //validations
  private readonly EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly PHONE_PATTERN =
    /^[0-9]{10}$/;

  private readonly QUALIFICATION_PATTERN =
    /^[A-Za-z\s.]+$/;
  username = '';
  role = '';
  applicantvisible = false;
  showAnalytics = true;
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
  //company names
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
  //selected languages for edit form
  selectedLanguageNames: string[] = [];
  showLanguages = false;
  selectedLanguages: Array<{
    name: string;
    read: boolean;
    write: boolean;
    speak: boolean;
    all: boolean;
  }> = [];
  applicants: any[] = [];
  searchText: string = '';
  showSuggestions = true;
  searchKeyword = '';
  searchMode = false;   // actual search performed after Enter
  viewMode: 'list' | 'grid' = 'list';
  selectedQualification = '';
  selectedGender = '';
  selectedLanguage = '';
  selectedCompany = '';
  selectedFromDate = '';
  selectedToDate = '';
  showFilters = false;

  toggleView(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }
  //edit
  editingId: number | null = null;
  editData = {
    name: '',
    email: '',
    phone: '',
    qualification: '',
    dob: '',
    gender: '',
    languages: '',
    companies: ''
  };
  editResumeFile: File | null = null;
  editMarksheetFile: File | null = null;
  showPhotoDialog = false;
  photoList: string[] = [];
  selectedApplicantId = 0;
  selectedProfilePhoto = '';
  selectedApplicant: any;
  applicantId: number = 0;
  selectApplicant(applicant: any): void {
    console.log("Selected Applicant:", applicant);
    this.applicantvisible = true;
    this.selectedApplicant = applicant;
    console.log(this.selectedApplicant);
  }

  toggleAnalytics(show: boolean): void {
    this.showAnalytics = show;
  }
  openDashboardWithFilters(): void {
    this.showAnalytics = false;
    this.viewMode = 'grid';
    this.showFilters = true;
  }
  get searchSuggestions(): any[] {
    if (!this.searchText.trim() || !this.showSuggestions) {
      return [];
    }

    return this.applicants
      .filter(a =>
        a.name?.toLowerCase().startsWith(
          this.searchText.toLowerCase()
        )
      )
      .slice(0, 5);
  }
  setSearch(value = ''): void {

    this.searchText = value;
    this.searchKeyword = value;
    this.searchMode = !!value.trim();
    this.showSuggestions = false;

  }

  onSearchInput() {
    this.showSuggestions = true; // show again when typing
  }


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  ngOnInit(): void {

    this.username = localStorage.getItem('username') || '';
    this.role = localStorage.getItem('role') || '';
    this.route.paramMap.subscribe(params => {
      this.applicantId = Number(params.get('id'));
      this.loadApplicants();
    });

  }
  private getAuthHeaders(): HttpHeaders {

    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

  }
  //loads the applicants

  loadApplicants(): void {

    const headers = this.getAuthHeaders();

    this.http.get<any[]>(
      this.API_URL,
      { headers }
    )
      .subscribe({

        next: (data) => {

          this.applicants = data;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading applicants:',
            error
          );

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
      dob: applicant.dob,
      gender: applicant.gender,
      languages: applicant.languages,
      companies: applicant.companies
    };

    this.editResumeFile = null;
    this.editMarksheetFile = null;
    this.selectedLanguages = this.parseStoredLanguages(applicant.languages);
    this.selectedLanguageNames = this.selectedLanguages.map(
      lang => lang.name
    );
    this.selectedCompanies =
      this.parseStoredCompanies(applicant.companies);
  }
  private resetEditForm(): void {

    this.editData = {
      name: '',
      email: '',
      phone: '',
      qualification: '',
      dob: '',
      gender: '',
      languages: '',
      companies: ''
    };

    this.editResumeFile = null;
    this.editMarksheetFile = null;
    this.selectedLanguages = [];
    this.selectedLanguageNames = [];
    this.selectedCompanies = [];
  }
  cancelEdit(): void {

    this.editingId = null;
    this.resetEditForm();

  }
  onFileSelect(
    event: any,
    type: 'resume' | 'marksheet'
  ): void {

    const file = event.target.files?.[0];

    if (!file) return;

    if (type === 'resume') {
      this.editResumeFile = file;
    } else {
      this.editMarksheetFile = file;
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
  toggleLanguage(language: string, event: any): void {
    event.target.checked
      ? this.addLanguage(language)
      : this.removeLanguage(language);
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
    language.read =
      language.write =
      language.speak =
      language.all;
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
    return (language.read ? 30 : 0)
      + (language.write ? 30 : 0)
      + (language.speak ? 40 : 0);
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
  getCompanySummary(value: string): string {

    if (!value) {
      return '';
    }

    try {
      return JSON.parse(value).join(', ');
    }
    catch {
      return value;
    }

  }
  parseStoredCompanies(value: string): string[] {

    if (!value) {
      return [];
    }
    try {
      return JSON.parse(value);
    } catch {
      return value.split(',').map(x => x.trim()).filter(Boolean);
    }
  }
  toggleCompany(company: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedCompanies.includes(company))
        this.selectedCompanies.push(company);
      return;
    }
    this.selectedCompanies =
      this.selectedCompanies.filter(c => c !== company);

  }
  //opens dialog
  openEditModal(applicant: any): void {
    this.startEdit(applicant);
    const dialog = document.getElementById('editDialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  }
  //closes dialogue
  closeEditModal(): void {
    const dialog =
      document.getElementById('editDialog') as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
    this.cancelEdit();
  }
  //validation
  private validateEditForm(): boolean {

    if (!this.editData.name.trim()) {
      alert('Please enter a name');
      return false;
    }

    const emailPattern = this.EMAIL_PATTERN
    if (!emailPattern.test(this.editData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    const phonePattern = this.PHONE_PATTERN;
    if (!phonePattern.test(this.editData.phone)) {
      alert('Phone number must contain exactly 10 digits');
      return false;
    }

    const qualificationPattern = this.QUALIFICATION_PATTERN;

    if (!qualificationPattern.test(this.editData.qualification)) {
      alert('Qualification should contain only letters');
      return false;
    }

    if (!this.editData.gender) {
      alert('Please select Gender');
      return false;
    }

    if (this.selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return false;
    }

    return true;
  }
  saveEdit(): void {

    if (!this.validateEditForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('name', this.editData.name.trim());
    formData.append('email', this.editData.email.trim());
    formData.append('phone', this.editData.phone.trim());
    formData.append('qualification', this.editData.qualification.trim());
    formData.append('dob', this.editData.dob);
    formData.append('gender', this.editData.gender);
    formData.append(
      'languages',
      JSON.stringify(this.selectedLanguages)
    );
    formData.append(
      'companies',
      JSON.stringify(this.selectedCompanies)
    );
    if (this.editResumeFile) {
      formData.append('resume', this.editResumeFile);
    }

    if (this.editMarksheetFile) {
      formData.append('marksheet', this.editMarksheetFile);
    }

    const headers = this.getAuthHeaders();

    this.http.put(
      `${this.API_URL}/${this.editingId}`,
      formData,
      {
        headers,
        responseType: 'text'
      }
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
  deleteApplicant(id: number): void {
    const confirmed = confirm(
      'Are you sure you want to delete this applicant?'
    );

    if (!confirmed) {
      return;
    }
    const headers = this.getAuthHeaders();
    this.http.delete(
      `${this.API_URL}/${id}`,
      {
        headers,
        responseType: 'text'
      }
    )
      .subscribe({
        next: (response) => {
          alert(response);
          this.loadApplicants();

        },
        error: (error) => {
          console.error(error);
          alert(error.error);
        }
      });
  }
  openPhotoDialog(applicant: any): void {

    this.selectedApplicantId = applicant.id;

    this.photoList = applicant.photoPaths
      ? applicant.photoPaths.split(',').map((p: string) => p.trim()).filter(Boolean)
      : [];

    this.showPhotoDialog = true;
  }
  closePhotoDialog(): void {
    this.showPhotoDialog = false;
    this.photoList = [];
  }
  //profile photo
  setProfilePhoto(photo: string): void {
    const headers = this.getAuthHeaders();
    this.http.put(
      `${this.API_URL}/${this.selectedApplicantId}/profile-photo`,
      {
        profilePhoto: photo
      },
      {
        headers,
        responseType: 'text'
      }
    ).subscribe({
      next: () => {
        const applicant = this.applicants.find(
          (a: any) => a.id === this.selectedApplicantId
        );
        if (applicant) {
          applicant.profilePhoto = photo;
        }
        this.closePhotoDialog();
        this.loadApplicants();
      },
      error: err => {
        console.error(err);
        alert('Failed to update profile photo');
      }
    });
  }
  getTimeAgo(date: string): string {

    const now = new Date().getTime();
    const updated = new Date(date).getTime();
    const seconds = Math.floor((now - updated) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    if (hours < 24) {
      return `${hours} hr ago`;
    }
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('companies');
    localStorage.removeItem('dob');
    localStorage.removeItem('name');

    this.router.navigateByUrl('/', {
      replaceUrl: true
    });
  }
  get filteredApplicants() {
    return this.applicants.filter(a =>
      (!this.selectedQualification || a.qualification === this.selectedQualification)
      &&
      (!this.selectedGender || a.gender === this.selectedGender)
      &&
      (!this.selectedLanguage || this.getLanguageSummary(a.languages)?.includes(this.selectedLanguage))
      &&
      (!this.selectedCompany || a.companies?.includes(this.selectedCompany))
      &&
      (!this.selectedFromDate || new Date(a.dob) >= new Date(this.selectedFromDate))
      &&
      (!this.selectedToDate || new Date(a.dob) <= new Date(this.selectedToDate))
    );
  }
}