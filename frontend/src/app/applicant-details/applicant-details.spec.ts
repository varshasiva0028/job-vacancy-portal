import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDetailsComponent } from './applicant-details';

describe('ApplicantDetails', () => {
  let component: ApplicantDetailsComponent;
  let fixture: ComponentFixture<ApplicantDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
