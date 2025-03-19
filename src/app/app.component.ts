import { Component, ViewEncapsulation } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, IMultiFilterParams } from 'ag-grid-community';

import {
  AllEnterpriseModule,
  LicenseManager,
  ModuleRegistry,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);
LicenseManager.setLicenseKey('<your license key>');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .floating-filter-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .clear-filter-button {
      display: none;
      position: absolute;
      top: 15px;
      right: 5px;
      cursor: pointer;
      background: none;
      border: none;
      color: #777;
      font-weight: bold;
      z-index: 10;
      font-size: 12px;
    }
    
    .clear-filter-button:hover {
      color: #333;
    }
  `],
  template: /* html */ `
    <ag-grid-angular
      class="ag-theme-quartz"
      style="height: 100%;"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [statusBar]="statusBar"
      (gridReady)="onGridReady($event)"
    >
    </ag-grid-angular>
  `,
})
export class AppComponent {
  private gridApi: any;
  private columnApi: any;

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Honda', model: 'Civic', price: 22000 },
    { make: 'Toyota', model: 'Camry', price: 25000 },
    { make: 'BMW', model: '3 Series', price: 42000 },
    { make: 'Mercedes', model: 'C-Class', price: 46000 },
    { make: 'Audi', model: 'A4', price: 40000 },
    { make: 'Volkswagen', model: 'Golf', price: 28000 },
    { make: 'Tesla', model: 'Model 3', price: 48000 },
    { make: 'Hyundai', model: 'Tucson', price: 26000 },
    { make: 'Kia', model: 'Sportage', price: 25000 },
    { make: 'Mazda', model: 'CX-5', price: 27000 },
    { make: 'Subaru', model: 'Forester', price: 29000 },
    { make: 'Nissan', model: 'Altima', price: 24000 },
    { make: 'Chevrolet', model: 'Malibu', price: 23000 },
    { make: 'Ford', model: 'Focus', price: 21000 },
    { make: 'Toyota', model: 'Corolla', price: 20000 },
    { make: 'Honda', model: 'Accord', price: 27000 },
    { make: 'Lexus', model: 'ES', price: 45000 }
  ];

  colDefs: ColDef[] = [
    { field: 'make', filter: 'agMultiColumnFilter', filterParams: {
      filters: [
        {
          filter: "agTextColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams},
    { field: 'model', filter: 'agMultiColumnFilter', filterParams: {
      filters: [
        {
          filter: "agTextColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams },
    { field: 'price', filter: 'agMultiColumnFilter', filterParams: {
      filters: [
        {
          filter: "agNumberColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams,},
  ];

  defaultColDef = {
    flex: 1,
    floatingFilter: true,
    suppressFilterButton: true,
   
  };

  statusBar = {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        align: 'left',
      },
    ],
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    
    // After grid is ready, inject clear buttons into floating filters
    setTimeout(() => {
      const floatingFilterContainers = document.querySelectorAll('.ag-floating-filter-body');
      
      floatingFilterContainers.forEach((container: Element, index) => {
        // Get the input from the container
        const input = container.querySelector('input');
        if (!input) return;
        
        // Create the clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-filter-button';
        clearButton.innerHTML = 'x';
        clearButton.style.display = 'none';
        clearButton.type = 'button'; // Ensure it's treated as a button
        
        // Setup input event listeners
        input.addEventListener('input', () => {
          clearButton.style.display = input.value ? 'block' : 'none';
        });
        
        // Setup clear button click handler
        clearButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          try {
            // Get the column ID
            const columnId = this.colDefs[index].field;
            
            if (columnId) {
              // Get the current filter model
              const currentFilterModel = this.gridApi.getFilterModel();
              
              // Remove only this column's filter
              if (currentFilterModel && currentFilterModel[columnId]) {
                delete currentFilterModel[columnId];
                this.gridApi.setFilterModel(currentFilterModel);
              }
              
              // Clear the input value
              input.value = '';
              
              // Dispatch input event to trigger filter update
              const event = new Event('input', { bubbles: true });
              input.dispatchEvent(event);
              
              // Hide the clear button
              clearButton.style.display = 'none';
            }
          } catch (error) {
            console.error('Error clearing filter:', error);
          }
        });
        
        // Add the clear button to the container
        container.appendChild(clearButton);
        
        // Check initial state
        if (input.value) {
          clearButton.style.display = 'block';
        }
      });
    }, 500); // Increased timeout to ensure all elements are loaded
  }
}
