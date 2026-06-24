import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-applicant-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './applicant-details.html',
  styleUrl: './applicant-details.css'
})
export class ApplicantDetailsComponent implements OnInit {

  applicant: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    this.http
      .get<any>(`http://localhost:8081/api/applicants/${id}`)
      .subscribe({

        next: (data) => {

          this.applicant = data;

          console.log(this.applicant);

        },

        error: (err) => {

          console.error("Failed to load applicant", err);

        }

      });

  }

  getLanguages(): string[] {

    if (!this.applicant?.languages) {
      return [];
    }

    return this.applicant.languages
      .split(',')
      .map((lang: string) => lang.trim())
      .filter((lang: string) => lang);

  }

  getCompanies(): string[] {

    if (!this.applicant?.companies) {
      return [];
    }

    return this.applicant.companies
      .split(',')
      .map((company: string) => company.trim())
      .filter((company: string) => company);

  }

  getPhotos(): string[] {

    if (!this.applicant?.photoPaths) {
      return [];
    }

    return this.applicant.photoPaths
      .split(',')
      .filter((photo: string) => photo);

  }

}