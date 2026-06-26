import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  userName = signal('');
  greeting = signal('');
  birthdayMessage = signal('');
  companies = signal<string[]>([]);

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    // username
    const username = localStorage.getItem('name');

    if (username) {

      const formattedName = username
        .toLowerCase()
        .split(' ')
        .map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ');

      this.userName.set(formattedName);

    }
    // Greeting message
    const hour = new Date().getHours();

    if (hour < 12) {

      this.greeting.set('🌞 Good Morning');

    }
    else if (hour < 17) {

      this.greeting.set('☀️ Good Afternoon');

    }
    else {

      this.greeting.set('🌙 Good Evening');

    }

    // companies
    const companiesData = localStorage.getItem('companies');

    if (companiesData) {

      this.companies.set(
        JSON.parse(companiesData)
      );

    }

    // Birthday
    const dob = localStorage.getItem('dob');

    if (dob) {

      const birthDate = new Date(dob);

      const today = new Date();

      if (
        birthDate.getDate() === today.getDate() &&
        birthDate.getMonth() === today.getMonth()
      ) {
        this.birthdayMessage.set(
          `🎉 Happy Birthday ${this.userName()}!\n🎂 
Wishing you happiness, good health, and success always.
Have a wonderful day! 🎈✨`

        );

      }

    }

  }

  goToDashboard(): void {

    this.router.navigate(['/user-dashboard']);

  }

  logout(): void {

    localStorage.clear();

    this.router.navigateByUrl('/', {
      replaceUrl: true
    });
  }

}