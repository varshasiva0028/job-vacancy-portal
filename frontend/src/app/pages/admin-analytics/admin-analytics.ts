import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalyticsComponent
  implements OnChanges, AfterViewInit, OnDestroy {

  @Input()
  applicants: any[] = [];

  @Output()
  back = new EventEmitter<void>();

  @ViewChild('companyCanvas')
  companyCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('qualificationCanvas')
  qualificationCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('languageCanvas')
  languageCanvas!: ElementRef<HTMLCanvasElement>;

  private viewReady = false;

  private companyChart?: Chart;

  private qualificationChart?: Chart;

  private languageChart?: Chart;

  totalApplicants = 0;
  totalCompanies = 0;
  totalLanguages = 0;
  totalQualifications = 0;

  maleCount = 0;
  femaleCount = 0;

  goBack(): void {

    this.back.emit();

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['applicants']) {
      return;
    }

    this.calculateSummary();

    if (this.viewReady) {

      this.refreshCharts();

    }

  }

  ngAfterViewInit(): void {

    this.viewReady = true;

    if (this.applicants.length) {

      this.refreshCharts();

    }

  }

  ngOnDestroy(): void {

    this.companyChart?.destroy();

    this.qualificationChart?.destroy();

    this.languageChart?.destroy();

  }

  private refreshCharts(): void {

    this.companyChart?.destroy();

    this.qualificationChart?.destroy();

    this.languageChart?.destroy();

    this.createCompanyChart();

    this.createQualificationChart();

    this.createLanguageChart();

  }
    calculateSummary(): void {

    this.totalApplicants = this.applicants.length;

    this.totalCompanies = 0;

    this.totalLanguages = 0;

    this.totalQualifications = 0;

    this.maleCount = 0;

    this.femaleCount = 0;

    const companySet = new Set<string>();

    const languageSet = new Set<string>();

    const qualificationSet = new Set<string>();

    this.applicants.forEach(applicant => {

      /* Gender */

      if (applicant.gender === 'Male') {

        this.maleCount++;

      }
      else if (applicant.gender === 'Female') {

        this.femaleCount++;

      }

      /* Qualification */

      if (applicant.qualification) {

        qualificationSet.add(applicant.qualification);

      }

      /* Companies */

      if (applicant.companies) {

        try {

          const companies = JSON.parse(applicant.companies);

          companies.forEach((company: string) => {

            companySet.add(company.trim());

          });

        }
        catch {

          applicant.companies
            .split(',')
            .map((company: string) => company.trim())
            .forEach((company: string) => {

              companySet.add(company);

            });

        }

      }

      /* Languages */

      if (applicant.languages) {

        try {

          const languages = JSON.parse(applicant.languages);

          languages.forEach((language: any) => {

            if (typeof language === 'string') {

              languageSet.add(language.trim());

            }
            else if (language.name) {

              languageSet.add(language.name);

            }

          });

        }
        catch {

          applicant.languages
            .split(',')
            .map((language: string) => language.trim())
            .forEach((language: string) => {

              languageSet.add(language);

            });

        }

      }

    });

    this.totalCompanies = companySet.size;

    this.totalLanguages = languageSet.size;

    this.totalQualifications = qualificationSet.size;

  }
  createCompanyChart(): void {

  const companyMap: { [key: string]: number } = {};

  this.applicants.forEach(applicant => {

    if (!applicant.companies) {
      return;
    }

    let companies: string[] = [];

    try {

      companies = JSON.parse(applicant.companies);

    }
    catch {

      companies = applicant.companies.split(',');

    }

    companies.forEach(company => {

      company = company.trim();

      companyMap[company] = (companyMap[company] || 0) + 1;

    });

  });

  this.companyChart = new Chart(
    this.companyCanvas.nativeElement,
    {

      type: 'bar',

      data: {

        labels: Object.keys(companyMap),

        datasets: [

          {

            label: 'Applicants',

            data: Object.values(companyMap),

            backgroundColor: [
              '#2563eb',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#06b6d4',
              '#ec4899',
              '#14b8a6',
              '#84cc16',
              '#f97316'
            ],

            borderRadius: 8

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          y: {

            beginAtZero: true,

            ticks: {

              stepSize: 1

            }

          }

        }

      }

    }

  );

}
createQualificationChart(): void {

  const qualificationMap: { [key: string]: number } = {};

  this.applicants.forEach(applicant => {

    qualificationMap[applicant.qualification] =
      (qualificationMap[applicant.qualification] || 0) + 1;

  });

  this.qualificationChart = new Chart(

    this.qualificationCanvas.nativeElement,

    {

      type: 'doughnut',

      data: {

        labels: Object.keys(qualificationMap),

        datasets: [

          {

            data: Object.values(qualificationMap),

            backgroundColor: [

              '#2563eb',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#06b6d4',
              '#ec4899'

            ]

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '60%',

        plugins: {

          legend: {

            position: 'bottom'

          }

        }

      }

    }

  );

}
createLanguageChart(): void {

  const languageMap: { [key: string]: number } = {};

  this.applicants.forEach(applicant => {

    if (!applicant.languages) {
      return;
    }

    let languages: any[] = [];

    try {

      languages = JSON.parse(applicant.languages);

    }
    catch {

      languages = applicant.languages.split(',');

    }

    languages.forEach(language => {

      let languageName = '';

      if (typeof language === 'string') {

        languageName = language.trim();

      }
      else if (language.name) {

        languageName = language.name;

      }

      if (languageName) {

        languageMap[languageName] =
          (languageMap[languageName] || 0) + 1;

      }

    });

  });

  this.languageChart = new Chart(

    this.languageCanvas.nativeElement,

    {

      type: 'bar',

      data: {

        labels: Object.keys(languageMap),

        datasets: [

          {

            label: 'Applicants',

            data: Object.values(languageMap),

            backgroundColor: '#2563eb',

            borderRadius: 8

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          y: {

            beginAtZero: true,

            ticks: {

              stepSize: 1

            }

          }

        }

      }

    }

  );

}
}