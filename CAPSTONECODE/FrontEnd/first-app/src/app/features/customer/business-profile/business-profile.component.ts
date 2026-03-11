import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessProfileService } from '../../../core/services/business-profile.service';
import { BusinessProfileDto } from '../../../core/models/business-profile.model';
import { AlertComponent } from '../../../shared/components/alert.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, LoadingSpinnerComponent],
  templateUrl: './business-profile.component.html'
})
export class BusinessProfileComponent implements OnInit {
  private businessProfileService = inject(BusinessProfileService);

  profile = signal<BusinessProfileDto | null>(null);
  editing = signal(false);
  loading = signal(false);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Form Signals
  businessName = signal('');
  industryType = signal('');
  employeeCount = signal(0);
  annualRevenue = signal(0);
  yearsInOperation = signal(0);
  location = signal('');
  hasSafetyCertification = signal(false);

  // File upload
  selectedFile = signal<File | null>(null);
  selectedFileName = signal('');
  uploading = signal(false);
  uploadedCertPath = signal('');

  industryOptions = [
    'IT', 'Finance', 'Healthcare', 'Construction',
    'Manufacturing', 'Retail', 'Education', 'Transport',
    'Consulting', 'Mining', 'Chemical', 'Food Processing',
    'Oil & Gas', 'Other'
  ];

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.businessProfileService.getMyProfile().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.profile.set(res.data);
          this.populateForm(res.data);
          this.editing.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404 || !err.error?.success) {
          // Profile doesn't exist
          this.profile.set(null);
          this.editing.set(true);
        } else {
          this.errorMessage.set('Failed to load profile.');
        }
      }
    });
  }

  editProfile() {
    if (this.profile()) {
      this.populateForm(this.profile()!);
    }
    this.editing.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit() {
    if (this.profile()) {
      this.editing.set(false);
    }
  }

  populateForm(data: BusinessProfileDto) {
    this.businessName.set(data.businessName);
    this.industryType.set(data.industryType);
    this.employeeCount.set(data.employeeCount);
    this.annualRevenue.set(data.annualRevenue);
    this.yearsInOperation.set(data.yearsInOperation);
    this.location.set(data.location);
    this.hasSafetyCertification.set(data.hasSafetyCertification);
  }

  saveProfile() {
    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const dto: any = {
      businessName: this.businessName(),
      industryType: this.industryType(),
      employeeCount: this.employeeCount(),
      annualRevenue: this.annualRevenue(),
      yearsInOperation: this.yearsInOperation(),
      location: this.location(),
      hasSafetyCertification: this.hasSafetyCertification(),
      safetyCertificatePath: this.uploadedCertPath() || undefined
    };

    const req = this.profile()
      ? this.businessProfileService.update(dto)
      : this.businessProfileService.create(dto);

    req.subscribe({
      next: (res: any) => {
        this.saving.set(false);
        if (res.success && res.data) {
          this.profile.set(res.data);
          this.editing.set(false);
          this.selectedFile.set(null);
          this.selectedFileName.set('');
          this.uploadedCertPath.set('');
          this.successMessage.set('Profile saved successfully.');
        } else {
          this.errorMessage.set(res.message || 'Error saving profile.');
        }
      },
      error: (err: any) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'A server error occurred.');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('File size must be less than 5MB.');
        return;
      }
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
    }
  }

  uploadCertificate() {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.errorMessage.set('');

    this.businessProfileService.uploadCertificate(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.success && res.data) {
          this.uploadedCertPath.set(res.data);
          this.successMessage.set('Certificate uploaded! Click Save Profile to complete.');
        } else {
          this.errorMessage.set(res.message || 'Upload failed.');
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMessage.set(err.error?.message || 'Upload failed.');
      }
    });
  }
}
