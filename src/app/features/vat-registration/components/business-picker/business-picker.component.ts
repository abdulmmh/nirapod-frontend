import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusinessVatStatus } from '../../../../models/business.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-business-picker',
  templateUrl: './business-picker.component.html',
  styleUrls: ['./business-picker.component.css'],
})
export class BusinessPickerComponent {
  /** Businesses to display. Populated by the parent once a taxpayer is selected. */
  @Input() businesses: BusinessVatStatus[] = [];

  /** True while the parent is loading businesses from the API. */
  @Input() loading = false;

  /** Currently selected business (null if none chosen). */
  @Input() selected: BusinessVatStatus | null = null;

  /** Emits the chosen business when the user clicks an eligible row. */
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
