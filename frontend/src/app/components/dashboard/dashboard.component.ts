import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TestParameter, TestResult } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective, FormsModule], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  parameters: TestParameter[] = [];
  results: TestResult[] = [];
  filteredResults: TestResult[] = [];
  username: string | null = '';
  isLoading: boolean = true;

  addParamError: string = '';
  editParamError: string = '';
  
  // Stan widoku
  selectedParamId: number | null = null;
  averageValue: number | null = null;
  selectedParamIsPrivate: boolean = false;

  // Modalne okna
  showEditResultModal: boolean = false;
  showDeleteResultModal: boolean = false;
  showEditParamModal: boolean = false;
  showDeleteParamModal: boolean = false;

  // Edytowane/usuwane elementy
  editingResultId: number | null = null;
  deletingResultId: number | null = null;
  editingParamId: number | null = null;

  sortColumn: 'date' | 'value' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  resultForm: FormGroup;
  paramForm: FormGroup;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Wynik', fill: false, tension: 0.3, borderColor: '#0d6efd', backgroundColor: '#0d6efd' }]
  };
  public lineChartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.username = localStorage.getItem('username');
    this.resultForm = this.fb.group({
      parameterId: ['', Validators.required],
      value: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
    this.paramForm = this.fb.group({
      name: ['', Validators.required],
      unit: [''],
      minNorm: [''],
      maxNorm: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.apiService.getParameters().subscribe({
      next: (data) => {
        this.parameters = data;
        this.updateSelectedParamState();
        this.cdr.detectChanges();
      }
    });
    this.apiService.getResults().subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
        if (this.selectedParamId) {
            this.filterResults();
        }
        this.cdr.detectChanges();
      },
      error: () => { 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  onParamSelectChange() {
    this.updateSelectedParamState();
    this.filterResults();
  }

  private updateSelectedParamState() {
    if (!this.selectedParamId) {
      this.selectedParamIsPrivate = false;
      return;
    }
    const param = this.parameters.find(p => p.id === this.selectedParamId);
    this.selectedParamIsPrivate = param?.privateParam ?? false;
  }

  filterResults() {
    if (this.selectedParamId) {
      this.filteredResults = this.results.filter(r => r.parameterId === this.selectedParamId);
      this.calculateAverage();
      this.applySort();
      this.updateChart();
    } else {
      this.filteredResults = [];
      this.averageValue = null;
    }
  }

  calculateAverage() {
    if (this.filteredResults.length === 0) {
      this.averageValue = null;
      return;
    }
    const sum = this.filteredResults.reduce((acc, curr) => acc + curr.value, 0);
    this.averageValue = sum / this.filteredResults.length;
  }

  openEditResultModal(result: TestResult) {
    this.editingResultId = result.id!;
    this.resultForm.patchValue({
      parameterId: result.parameterId,
      value: result.value,
      date: result.date
    });
    this.resultForm.get('parameterId')?.disable();
    this.showEditResultModal = true;
  }

  closeEditResultModal() {
    this.showEditResultModal = false;
    this.editingResultId = null;
    this.resultForm.get('parameterId')?.enable();
    this.resultForm.reset({
      parameterId: this.selectedParamId,
      value: '',
      date: new Date().toISOString().split('T')[0]
    });
  }

  openDeleteResultModal(id: number) {
    this.deletingResultId = id;
    this.showDeleteResultModal = true;
  }

  closeDeleteResultModal() {
    this.showDeleteResultModal = false;
    this.deletingResultId = null;
  }

  confirmDeleteResult() {
    if (!this.deletingResultId) return;
    
    this.apiService.deleteResult(this.deletingResultId).subscribe({
      next: () => {
        this.results = this.results.filter(r => r.id !== this.deletingResultId);
        this.filterResults();
        this.closeDeleteResultModal();
        this.cdr.detectChanges();
      }
    });
  }

  submitResultEdit() {
    if (this.resultForm.invalid || !this.editingResultId) return;

    const dto = this.resultForm.getRawValue();
    
    this.apiService.updateResult(this.editingResultId, dto).subscribe(updated => {
      const index = this.results.findIndex(r => r.id === updated.id);
      if (index !== -1) {
        updated.parameterName = this.results[index].parameterName;
        updated.parameterUnit = this.results[index].parameterUnit;
        updated.minNorm = this.results[index].minNorm;
        updated.maxNorm = this.results[index].maxNorm;
        this.results[index] = updated;
      }
      
      this.filterResults();
      this.closeEditResultModal();
      this.cdr.detectChanges();
    });
  }

  openEditParamModal() {
    if (!this.selectedParamId) return;
    const param = this.parameters.find(p => p.id === this.selectedParamId);
    if (param) {
      this.editingParamId = param.id!;
      this.paramForm.patchValue(param);
      this.showEditParamModal = true;
    }
  }

  closeEditParamModal() {
    this.showEditParamModal = false;
    this.editingParamId = null;
    this.editParamError = '';
    this.paramForm.reset();
  }

  openDeleteParamModal() {
    if (!this.selectedParamId) return;
    this.showDeleteParamModal = true;
  }

  closeDeleteParamModal() {
    this.showDeleteParamModal = false;
  }

  confirmDeleteParam() {
    if (!this.selectedParamId) return;

    this.apiService.deleteParameter(this.selectedParamId).subscribe({
      next: () => {
        this.parameters = this.parameters.filter(p => p.id !== this.selectedParamId);
        this.results = this.results.filter(r => r.parameterId !== this.selectedParamId);
        this.selectedParamId = null;
        this.selectedParamIsPrivate = false;
        this.filterResults();
        this.closeDeleteParamModal();
        this.cdr.detectChanges();
      }
    });
  }

  submitParamEdit() {
    if (this.paramForm.invalid || !this.editingParamId) return;
    
    this.editParamError = ''; 

    this.apiService.updateParameter(this.editingParamId, this.paramForm.value).subscribe({
      next: (res) => {
        const index = this.parameters.findIndex(p => p.id === res.id);
        if (index !== -1) this.parameters[index] = res;
        
        this.results.forEach(r => {
          if (r.parameterId === res.id) {
            r.parameterUnit = res.unit;
            r.minNorm = res.minNorm;
            r.maxNorm = res.maxNorm;
          }
        });
        
        if (this.selectedParamId === res.id) this.filterResults();
        this.closeEditParamModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.error && err.error.error) {
          this.editParamError = err.error.error;
        } else {
          this.editParamError = "Wystąpił błąd zapisu.";
        }
        this.cdr.detectChanges();
      }
    });
  }

  submitResult() {
    if (this.resultForm.invalid) return;

    this.apiService.addResult(this.resultForm.value).subscribe(newResult => {
      this.results.unshift(newResult);

      if (this.selectedParamId === newResult.parameterId) {
        this.filterResults();
      } else {
        this.selectedParamId = newResult.parameterId;
        this.updateSelectedParamState(); 
        this.filterResults();
      }
      
      this.resultForm.reset({
        parameterId: this.selectedParamId,
        value: '',
        date: new Date().toISOString().split('T')[0]
      });
      this.cdr.detectChanges();
    });
  }

  submitParam() {
    if (this.paramForm.invalid) return;
    this.addParamError = '';

    this.apiService.addParameter(this.paramForm.value).subscribe({
      next: (res) => {
        this.parameters.push(res);
        this.paramForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addParamError = err.error.error || "Wystąpił błąd zapisu.";
        this.cdr.detectChanges();
      }
    });
  }

  updateChart() {
    const chartData = [...this.filteredResults].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = chartData.map(r => r.date);
    const values = chartData.map(r => r.value);
    const minNorm = chartData.length > 0 ? chartData[0].minNorm : null;
    const maxNorm = chartData.length > 0 ? chartData[0].maxNorm : null;
    const normPointRadius = values.length === 1 ? 5 : 0;

    const datasets: any[] = [{
      data: values, label: 'Wynik', fill: false, tension: 0.3, borderColor: '#0d6efd', backgroundColor: '#0d6efd', pointBackgroundColor: '#0d6efd', pointRadius: 5
    }];
    if (minNorm != null) datasets.push({ data: values.map(() => minNorm), label: 'Min', fill: false, borderColor: 'rgba(220, 53, 69, 0.6)', borderDash: [5, 5], pointRadius: normPointRadius, borderWidth: 2 });
    if (maxNorm != null) datasets.push({ data: values.map(() => maxNorm), label: 'Max', fill: false, borderColor: 'rgba(220, 53, 69, 0.6)', borderDash: [5, 5], pointRadius: normPointRadius, borderWidth: 2 });

    this.lineChartData = { labels, datasets };
    this.chart?.update();
  }

  toggleSort(column: 'date' | 'value') {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortColumn = column; this.sortDirection = 'desc'; }
    this.applySort();
  }

  applySort() {
    this.filteredResults.sort((a, b) => {
      let valA: any = a[this.sortColumn];
      let valB: any = b[this.sortColumn];
      if (this.sortColumn === 'date') { valA = new Date(a.date).getTime(); valB = new Date(b.date).getTime(); }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}