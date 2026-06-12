import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn(): boolean {

    return localStorage.getItem('token') !== null;

  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('role');

  }

}