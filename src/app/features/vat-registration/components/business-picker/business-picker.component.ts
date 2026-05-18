import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusinessVatStatus } from '../../../../models/business.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-business-picker',
  templateUrl: './business-picker.component.html',
  styleUrls: ['./business-picker.component.css'],
})
export class BusinessPickerComponent {
  @Input() businesses: BusinessVatStatus[] = [];

<<<<<<< HEAD
=======

>>>>>>> 43206aa5a978ca012497e25b7f5387c2b0d42be3
  @Input() loading = false;

  @Input() selected: BusinessVatStatus | null = null;

<<<<<<< HEAD
=======

>>>>>>> 43206aa5a978ca012497e25b7f5387c2b0d42be3
  @Output() businessSelected = new EventEmitter<BusinessVatStatus>();

  constructor(private toast: ToastService) {}

  onSelect(b: BusinessVatStatus): void {
    if (b.vatRegistered) {
      this.toast.error(
        `"${b.businessName}" already has a VAT registration. BIN: ${b.binNo}`,
      );
      return;
    }
    this.businessSelected.emit(b);
  }

  getStatusClass(status: string | null): string {
    if (!status) return '';
    const map: Record<string, string> = {
      Active:    'status-active',
      Inactive:  'status-inactive',
      Pending:   'status-pending',
      Suspended: 'status-suspended',
      Cancelled: 'status-inactive',
    };
    return map[status] ?? '';
  }
}
