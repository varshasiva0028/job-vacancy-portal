import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebarComponent {

  @Input() currentPage: 'dashboard' | 'analytics' = 'analytics';

  @Output() dashboard = new EventEmitter<void>();

  @Output() analytics = new EventEmitter<void>();

  @Output() filters = new EventEmitter<void>();

  @Output() logout = new EventEmitter<void>();

}