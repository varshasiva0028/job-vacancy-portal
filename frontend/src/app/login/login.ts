import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DashboardComponent } from '../pages/dashboard/dashboard';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardComponent
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent  {
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
        'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada',
        'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia'
      ]
    },
    {
      label: 'Foreign Languages',
      options: [
        'English', 'Japanese', 'French', 'German', 'Spanish',
        'Chinese', 'Korean', 'Russian', 'Italian', 'Arabic'
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
  showDashboard = false;

  isLoggedIn = false;
  isRegisterMode = false;

  loginInput = {
    usernameOrEmail: '',
    password: ''
  };
  loginError = '';

  registerInput = {
    usernameOrEmail: '',
    password: '',
    confirmPassword: ''
  };
constructor(
  private http: HttpClient,
  private router: Router,

) { }

  login(): void {

  const email = this.loginInput.usernameOrEmail.trim().toLowerCase();
  const password = this.loginInput.password;

  if (!email) {
    alert('Please enter your Username or Email ID');
    return;
  }

  if (!password) {
    alert('Please enter your Password');
    return;
  }

  const formData = new FormData();
//creates the request
  formData.append('username', email);
  formData.append('password', password);
//Calls Backend
this.http.post<any>(
  'http://localhost:8081/api/users/login',
  formData
)
.subscribe({

  next: (response) => {

    localStorage.setItem(
      'token',
      response.token
    );

    localStorage.setItem(
      'role',
      response.role
    );

    this.isLoggedIn = true;
    this.loginError = '';

    alert('Login Successful');

    this.router.navigate(['apply']);
  },

  error: (error) => {

    this.loginError =
      error.error || 'Invalid username or password';

    alert(this.loginError);

  }

});

}

 register(): void {

  const email = this.registerInput.usernameOrEmail.trim().toLowerCase();
  const password = this.registerInput.password;
  const confirmPassword = this.registerInput.confirmPassword;
//validation
  if (!email) {
    alert('Please enter a Username or Email ID');
    return;
  }

  if (!password) {
    alert('Please enter a Password');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  const formData = new FormData();
//creates the request
  formData.append('username', email);
  formData.append('password', password);
//Calls Backend
  this.http.post(
    'http://localhost:8081/api/users/register',
    formData,
    { responseType: 'text' }
  ).subscribe({
    next: (response) => {

      alert(response);

      this.registerInput = {
        usernameOrEmail: '',
        password: '',
        confirmPassword: ''
      };

      this.isRegisterMode = false;
    },

    error: (error) => {

      if (error.error) {
        alert(error.error);
      } else {
        alert('Registration Failed');
      }

    }
  });

}
  logout(): void {
    this.isLoggedIn = false;
    this.loginInput = {
      usernameOrEmail: '',
      password: ''
    };
    this.loginError = '';
    alert('Logged out successfully');
  }

  onResumeSelect(event: any): void {
    this.resumeFile = event.target.files[0];
  }

  onMarksheetSelect(event: any): void {
    this.marksheetFile = event.target.files[0];
  }
  onPhotoSelect(event: any): void {
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

  if (!this.selectedLanguages.some(x => x.name === name)) {

    this.selectedLanguages.push(
      this.createLanguageSkill(name)
    );

  }

}

showLanguages = false;

toggleLanguage(language: string, event: any): void {

  if (event.target.checked) {

    if (!this.selectedLanguageNames.includes(language)) {

      this.selectedLanguageNames.push(language);

    }

    this.addLanguage(language);

  } else {

    this.removeLanguage(language);

  }

}
removeLanguage(name: string): void {

  this.selectedLanguages =
    this.selectedLanguages.filter(
      x => x.name !== name
    );

  this.selectedLanguageNames =
    this.selectedLanguageNames.filter(
      x => x !== name
    );

}

  syncSelectedLanguages(names: string[]): void {

    const removed =
      this.selectedLanguages
        .map(x => x.name)
        .filter(x => !names.includes(x));

    removed.forEach(x =>
      this.removeLanguage(x)
    );

    names.forEach(x => {

      if (!this.selectedLanguages.some(y => y.name === x)) {

        this.addLanguage(x);

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

    if (language.read) progress += 30;
    if (language.write) progress += 30;
    if (language.speak) progress += 40;

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
    if (!this.resumeFile || !this.marksheetFile || !this.photoFile) {
      alert('Please upload Resume and Marksheet and photo');
      return;
    }
    if (!this.applicant.gender) {
      alert('Please select Gender');
      return;
    }

    if (this.selectedLanguages.length === 0) {
      alert('Please select Language Known');
      return;
    }
    const formData = new FormData();

    formData.append('name', this.applicant.name);
    formData.append('email', this.applicant.email);
    formData.append('phone', this.applicant.phone);
    formData.append('qualification', this.applicant.qualification);
    formData.append('resume', this.resumeFile);
    formData.append('marksheet', this.marksheetFile);
    formData.append('photo', this.photoFile);
    formData.append('gender', this.applicant.gender);
    formData.append(
      'languages',
      JSON.stringify(this.selectedLanguages)
    );
    formData.append(
  'companies',
  JSON.stringify(this.selectedCompanies)
);
    this.http.post(
      'http://localhost:8081/api/applicants',
      formData,
      { responseType: 'text' }
    ).subscribe({ 
      next: (response: string) => {
        console.log(response);
        this.submitted = true;
        alert('Application Submitted Successfully');
      },

      error: (error: any) => {

        console.error(error);

        if (error.status === 409) {
          alert('This email is already registered.');
        }
        else if (error.error) {
          alert(error.error);
        }
        else {
          alert('Submission Failed');
        }

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