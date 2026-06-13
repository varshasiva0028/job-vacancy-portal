import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//Central place for authentication  
export class AuthService {

  constructor() { }
//checks user logged in or not by checking token in localStorage
  isLoggedIn(): boolean {

    return localStorage.getItem('token') !== null;

  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('role');

  }

}