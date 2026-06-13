import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent implements OnInit {

  applicant: any = {};

  editMode = false;

  companies: string[] = [];

  languages: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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

        this.applicant = response;

        // Companies
        if (response.companies) {

          this.companies = response.companies
            .replace('[', '')
            .replace(']', '')
            .replaceAll('"', '')
            .split(',')
            .map((company: string) => company.trim());

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

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/']);

  }

}