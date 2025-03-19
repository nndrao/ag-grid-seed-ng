import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, IMultiFilterParams } from 'ag-grid-community';

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
      font-weight: bold;
      z-index: 10;
      font-size: 12px;
      opacity: 0.7;
      transition: opacity 0.2s;
      color: inherit;
    }
    
    .clear-filter-button:hover {
      opacity: 1;
    }
    
    /* Theme-specific styles */
    .ag-theme-quartz .clear-filter-button,
    .ag-theme-quartz-light .clear-filter-button {
      color: #333;
    }
    
    .ag-theme-quartz-dark .clear-filter-button,
    .ag-theme-alpine-dark .clear-filter-button,
    .ag-theme-balham-dark .clear-filter-button {
      color: #fff;
    }
    
    /* For Material theme */
    .ag-theme-material .clear-filter-button {
      color: rgba(0, 0, 0, 0.87);
    }
    
    .ag-theme-material-dark .clear-filter-button {
      color: rgba(255, 255, 255, 0.87);
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
export class AppComponent implements OnDestroy {
  private gridApi: GridApi | null = null;
  private columnApi: any = null;
  private eventListeners: Array<{ element: Element; type: string; listener: EventListener }> = [];
  private timeoutId: any = null;

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
    
    // Clear any existing timeout to prevent memory leaks
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // After grid is ready, inject clear buttons into floating filters
    this.timeoutId = setTimeout(() => {
      this.injectClearButtons();
    }, 500);
  }

  /**
   * Injects clear buttons into floating filters
   * Extracted to a separate method for better organization
   */
  private injectClearButtons(): void {
    if (!this.gridApi) return;
    
    const floatingFilterContainers = document.querySelectorAll('.ag-floating-filter-body');
    
    floatingFilterContainers.forEach((container: Element, index) => {
      if (index >= this.colDefs.length) return; // Safety check
      
      // Get the input from the container
      const input = container.querySelector('input');
      if (!input) return;
      
      // Create the clear button
      const clearButton = document.createElement('button');
      clearButton.className = 'clear-filter-button';
      clearButton.innerHTML = 'x';
      clearButton.style.display = 'none';
      clearButton.type = 'button'; // Ensure it's treated as a button
      clearButton.title = 'Clear filter'; // Add tooltip
      
      // Setup input event listeners with debouncing
      const handleInput = this.debounce(() => {
        clearButton.style.display = input.value ? 'block' : 'none';
      }, 100);
      
      this.addEventListenerWithTracking(input, 'input', handleInput);
      
      // Setup clear button click handler
      this.addEventListenerWithTracking(clearButton, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          // Get the column ID
          const columnId = this.colDefs[index].field;
          
          if (columnId && this.gridApi) {
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
  }
  
  /**
   * Add event listener with tracking for cleanup
   */
  private addEventListenerWithTracking(
    element: Element, 
    eventType: string, 
    listener: EventListener
  ): void {
    element.addEventListener(eventType, listener);
    this.eventListeners.push({ element, type: eventType, listener });
  }
  
  /**
   * Simple debounce function to prevent excessive handling
   */
  private debounce(func: Function, wait: number): any {
    let timeout: any;
    const self = this; // Capture this context
    return function(...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(self, args), wait);
    };
  }

  /**
   * Cleanup when component is destroyed
   */
  ngOnDestroy(): void {
    // Clear any pending timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Remove all event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    
    // Clear references
    this.eventListeners = [];
    this.gridApi = null;
    this.columnApi = null;
  }
}
