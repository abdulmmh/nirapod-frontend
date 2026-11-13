import { Subject, of, throwError } from 'rxjs';
import { DashboardHomeComponent } from './dashboard-home.component';

describe('Dashboard chart rendering', () => {
  let component: DashboardHomeComponent;
  let container: HTMLDivElement;

  beforeEach(() => {
    component = new DashboardHomeComponent({} as any, {} as any, {} as any);
    container = document.createElement('div');
    container.innerHTML = '<canvas id="vatChart" style="width:400px;height:200px"></canvas><canvas id="payChart" style="width:400px;height:200px"></canvas>';
    document.body.appendChild(container);
  });
  afterEach(() => { component.ngOnDestroy(); container.remove(); });

  it('renders empty charts before data arrives without accessing a missing point', () => {
    expect(() => component.drawVatChart()).not.toThrow();
    expect(() => component.drawPayChart()).not.toThrow();
  });

  it('renders one data point with finite coordinates and an empty target series', () => {
    component.vatMonths = ['Nov']; component.vatData = [1];
    component.payMonths = ['Nov']; component.payData = [1];
    const context = (container.querySelector('#vatChart') as HTMLCanvasElement).getContext('2d')!;
    const arc = spyOn(context, 'arc').and.callThrough();
    expect(() => component.drawVatChart()).not.toThrow();
    expect(() => component.drawPayChart()).not.toThrow();
    expect(arc).toHaveBeenCalled();
    arc.calls.allArgs().forEach(args => expect(Number.isFinite(args[0])).toBeTrue());
  });

  it('clears the previous year when the next response has no chart data', () => {
    (component as any).applyChartData({ vatChart: [{label: 'Nov', value: 100000}], paymentChart: [{label: 'Nov', value: 100000}] });
    expect(component.vatData).toEqual([1]);
    (component as any).applyChartData({ vatChart: [], paymentChart: [] });
    expect(component.vatData).toEqual([]);
    expect(component.payData).toEqual([]);
    expect(component.vatMonths).toEqual([]);
    expect(() => component.drawVatChart()).not.toThrow();
  });
  it('shows completed sections while other requests are pending and isolates errors', () => {
    const stats = new Subject<any>();
    const waiting = new Subject<any>();
    const service: any = {
      getStats: () => stats,
      getRecentTaxpayers: () => of([{fullName:'Loaded taxpayer',tin:'DEMO',status:'Active'}]),
      getRecentPayments: () => throwError(() => new Error('unavailable')),
      getChartData: () => waiting, getFiscalYears: () => waiting, getZones: () => waiting,
    };
    component = new DashboardHomeComponent({currentUser: {fullName:'Demo'}} as any, service, {} as any);
    component.ngOnInit();
    expect(component.recentTaxpayers[0].name).toBe('Loaded taxpayer');
    expect(component.hasError).toBeTrue();
    expect(component.isLoading).toBeTrue();
    expect(component.loadingSections).toBe(4);
    component.ngOnDestroy();
  });
});
