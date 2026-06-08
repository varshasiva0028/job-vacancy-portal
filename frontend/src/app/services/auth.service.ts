import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface RegisterUser {
  usernameOrEmail: string;
  password: string;
}

export interface AuthUser {
  id: number;
  usernameOrEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: AuthUser | null = null;
  private registeredUsers: RegisterUser[] = [
    { usernameOrEmail: 'admin@portal.com', password: 'password123' },
    { usernameOrEmail: 'admin', password: 'password123' },
    { usernameOrEmail: 'user@portal.com', password: 'password123' },
    { usernameOrEmail: 'user', password: 'password123' }
  ];
  private userIdCounter = 5; // Start from 5 since we have 4 hardcoded users

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  /**
   * Register a new user
   */
  register(usernameOrEmail: string, password: string, confirmPassword: string): { success: boolean; message: string } {
    const email = usernameOrEmail.trim().toLowerCase();

    if (!email) {
      return { success: false, message: 'Please enter a Username or Email ID' };
    }

    if (!password) {
      return { success: false, message: 'Please enter a Password' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match!' };
    }

    // Check if user already exists
    const userExists = this.registeredUsers.some(
      u => u.usernameOrEmail.trim().toLowerCase() === email
    );

    if (userExists) {
      return { success: false, message: 'This username/email is already registered!' };
    }

    // Register user
    this.registeredUsers.push({ usernameOrEmail: email, password });
    this.saveToStorage();

    return { success: true, message: 'Registration Successful! Please log in.' };
  }

  /**
   * Login user
   */
  login(usernameOrEmail: string, password: string): { success: boolean; message: string; userId?: number } {
    const email = usernameOrEmail.trim().toLowerCase();

    if (!email) {
      return { success: false, message: 'Please enter your Username or Email ID' };
    }

    if (!password) {
      return { success: false, message: 'Please enter your Password' };
    }

    // Find user
    const userIndex = this.registeredUsers.findIndex(
      u => u.usernameOrEmail.trim().toLowerCase() === email && u.password === password
    );

    if (userIndex !== -1) {
      // Assign ID based on index (hardcoded users get IDs 1-4, new users start from 5)
      const userId = userIndex < 4 ? userIndex + 1 : userIndex + 1;
      
      this.currentUser = {
        id: userId,
        usernameOrEmail: email
      };
      this.saveToStorage();

      return { success: true, message: 'Login Successful!', userId };
    }

    return { success: false, message: 'Invalid username/email or password' };
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUser = null;
    this.saveToStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Get current logged-in user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number {
    return this.currentUser?.id || 0;
  }

  /**
   * Save auth state to localStorage
   */
  private saveToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
    localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
  }

  /**
   * Load auth state from localStorage
   */
  private loadFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedUsers = localStorage.getItem('registeredUsers');

    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if (storedUsers) {
      this.registeredUsers = JSON.parse(storedUsers);
    }
  }
}
