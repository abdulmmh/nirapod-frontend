import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { AccountCategory, RegistrationState } from '../../../../../models/registration.model';
import { API_ENDPOINTS } from '../../../../../core/constants/api.constants';

interface TaxpayerType {
  id: number;
  typeName: string;
  category: string;
}

@Component({
  selector: 'app-reg-step-account-type',
  templateUrl: './reg-step-account-type.component.html',
  styleUrls: ['./reg-step-account-type.component.css'],
})
export class RegStepAccountTypeComponent implements OnInit, OnDestroy {

  private readonly toast = inject(ToastService);

  @Input()  state!: RegistrationState;
  @Output() next = new EventEmitter<Partial<RegistrationState>>();

  allTypes    : TaxpayerType[] = [];
  isLoading   = false;

  selectedCategory : AccountCategory | null = null;
  selectedTypeId   : number | null = null;

  readonly categories: AccountCategory[] = ['Individual', 'Business', 'Organization'];

  readonly categoryMeta: Record<AccountCategory, { icon: string; desc: string; color: string }> = {
    Individual  : { icon: 'bi-person-fill',   desc: 'Personal taxpayer — requires NID',        color: 'blue'   },
    Business    : { icon: 'bi-shop-window',   desc: 'Business entity — requires RJSC number',  color: 'green'  },
    Organization: { icon: 'bi-building-fill', desc: 'NGO, Govt body or Foreign entity',        color: 'purple' },
  };

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Restore state if user navigated back from step 2
    this.selectedCategory = this.state.accountCategory;
    this.selectedTypeId   = this.state.taxpayerTypeId;
    this.loadTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTypes(): void {
    this.isLoading = true;
    this.http.get<TaxpayerType[]>(API_ENDPOINTS.MASTER_DATA.TAXPAYER_TYPES)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next : data  => this.allTypes = data,
        error: _err  => {
          this.toast.error('Failed to load taxpayer types. Please try again.');
        },
      });
  }

  get filteredTypes(): TaxpayerType[] {
    if (!this.selectedCategory) return [];
    return this.allTypes.filter(t => t.category === this.selectedCategory);
  }

  get canProceed(): boolean {
    return !!this.selectedCategory && !!this.selectedTypeId;
  }

  selectCategory(cat: AccountCategory): void {
    this.selectedCategory = cat;
    this.selectedTypeId   = null;   // reset when category changes
  }

  selectType(type: TaxpayerType): void {
    this.selectedTypeId = type.id;
  }

  onNext(): void {
    if (!this.canProceed) {
      this.toast.warning('Please select an account category and taxpayer type.');
      return;
    }
    const selected = this.allTypes.find(t => t.id === this.selectedTypeId)!;
    this.next.emit({
      accountCategory : this.selectedCategory!,
      taxpayerTypeId  : this.selectedTypeId!,
      taxpayerTypeName: selected.typeName,
    });
  }
}
