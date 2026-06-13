import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent  {
  
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
  // Store token and role in localStorage after successfull login
  localStorage.setItem('token', response.token);
  localStorage.setItem('role', response.role);

  this.isLoggedIn = true;
  this.loginError = '';

  const token = response.token;
// Check if the user has an existing application
 this.http.get(
'http://localhost:8081/api/applicants/my'
).subscribe({

    next: () => {

      // Application exists
      alert('Login Successful');

      this.router.navigate(['/dashboard']);

    },

    error: (err) => {

      if (err.status === 404) {

        // No application yet
        alert('Login Successful');

        this.router.navigate(['/apply']);

      } else {

        alert('Unable to load user details');

      }

    }

  });

},
// Handle login errors
  error: (error) => {

    this.loginError =
      error.error || 'Invalid username or password';

    alert(this.loginError);

  }

});

}
//  Handles user registration with validation and backend integration

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
}