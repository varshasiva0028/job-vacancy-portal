import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnalyticsComponent } from './admin-analytics';

describe('AdminAnalytics', () => {
  let component: AdminAnalyticsComponent;
  let fixture: ComponentFixture<AdminAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnalyticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAnalyticsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
