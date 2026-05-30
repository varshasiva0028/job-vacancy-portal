import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  applicants: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApplicants();
  }

  loadApplicants(): void {

    this.http.get<any[]>('http://localhost:8081/api/applicants')
      .subscribe(data => {

        this.applicants = [...data];

        this.cdr.detectChanges();

      });
  }
}