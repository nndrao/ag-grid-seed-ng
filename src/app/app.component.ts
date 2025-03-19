import { Component, ViewEncapsulation } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

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
  ];

  colDefs: ColDef[] = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
  ];

  defaultColDef = {
    flex: 1,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    suppressFilterButton: true,
    filterParams: {
      debounceMs: 200
    }
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
