import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  IMultiFilterParams, 
  ColumnMovedEvent, 
  ColumnVisibleEvent, 
  GridReadyEvent, 
  ColumnResizedEvent,
  ColumnPinnedEvent
} from 'ag-grid-community';

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
    /* Create a wrapper for filter inputs */
    .ag-floating-filter-body {
      position: relative;
    }
    
    /* Style for the floating filter inputs */
    .ag-floating-filter-input, 
    .ag-floating-filter-body input {
      padding-right: 25px !important;
      width: 100%;
    }
    
    /* Clear button as a real button element */
    .ag-filter-clear-button {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
      opacity: 0.7;
      transition: opacity 0.2s;
      z-index: 50;
      width: 16px;
      height: 16px;
      line-height: 14px;
      text-align: center;
      background: rgba(0,0,0,0.05);
      border-radius: 50%;
      border: none;
      padding: 0;
      margin: 0;
      display: none;
    }
    
    .ag-filter-clear-button:hover {
      opacity: 1;
      background: rgba(0,0,0,0.1);
    }
    
    /* Theme-specific styles */
    .ag-theme-quartz .ag-filter-clear-button,
    .ag-theme-quartz-light .ag-filter-clear-button {
      color: #333;
    }
    
    .ag-theme-quartz-dark .ag-filter-clear-button,
    .ag-theme-alpine-dark .ag-filter-clear-button,
    .ag-theme-balham-dark .ag-filter-clear-button {
      color: #fff;
    }
    
    /* For Material theme */
    .ag-theme-material .ag-filter-clear-button {
      color: rgba(0, 0, 0, 0.87);
    }
    
    .ag-theme-material-dark .ag-filter-clear-button {
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
      (columnMoved)="onColumnEvent($event)"
      (columnResized)="onColumnEvent($event)"
      (columnVisible)="onColumnEvent($event)"
      (columnPinned)="onColumnEvent($event)"
    >
    </ag-grid-angular>
  `,
})
export class AppComponent implements OnDestroy {
  private gridApi: GridApi | null = null;
  private eventListeners: Array<{ element: Element; type: string; listener: EventListener }> = [];
  private timeoutId: any = null;
  private gridInitialized = false;

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

  /**
   * Called when the grid is ready
   */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    
    // Clear any existing timeout to prevent memory leaks
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Set grid as initialized
    this.gridInitialized = true;
    
    // After grid is ready, setup filter events
    this.timeoutId = setTimeout(() => {
      this.setupFilterEvents();
    }, 500);
  }

  /**
   * Handle column events (moved, resized, visible changes)
   * This ensures filter events are properly updated when columns change
   */
  onColumnEvent(event: ColumnMovedEvent | ColumnVisibleEvent | ColumnResizedEvent | ColumnPinnedEvent) {
    if (!this.gridInitialized) return;
    
    // Clear any existing timeout to debounce multiple events
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Refresh filter events after a short delay to allow AG Grid to update the DOM
    this.timeoutId = setTimeout(() => {
      this.cleanupExistingEvents();
      this.setupFilterEvents();
    }, 100);
  }

  /**
   * Cleanup existing event listeners
   */
  private cleanupExistingEvents(): void {
    // Clean up all event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    
    // Clear the event listeners array
    this.eventListeners = [];
    
    // Remove clear buttons
    document.querySelectorAll('.ag-filter-clear-button').forEach(el => {
      el.remove();
    });
  }

  /**
   * Sets up events for the filter inputs and clear buttons
   */
  private setupFilterEvents(): void {
    if (!this.gridApi) return;
    
    // Get all visible columns (including those in column groups)
    const visibleColumns = this.gridApi.getAllDisplayedColumns() || [];
    
    // Find all floating filter containers
    const floatingFilterContainers = document.querySelectorAll('.ag-floating-filter-body');
    
    // Track columns that already have been processed to avoid duplicates
    const processedColumns = new Set<string>();
    
    floatingFilterContainers.forEach((container: Element, index) => {
      // Get the input from the container
      const input = container.querySelector('input');
      if (!input) return;
      
      // Find the input wrapper (container that directly holds the input)
      const inputWrapper = input.parentElement;
      if (!inputWrapper) return;
      
      // Get the column element
      const columnElement = this.findParentColumn(container);
      if (!columnElement) return;
      
      // Get column ID from DOM attribute or from position
      const columnId = columnElement.getAttribute('col-id') || 
                      (index < visibleColumns.length ? visibleColumns[index].getColId() : null);
      
      if (!columnId || processedColumns.has(columnId)) return;
      processedColumns.add(columnId);
      
      // Make input wrapper relative if it's not already
      if (window.getComputedStyle(inputWrapper).position !== 'relative') {
        (inputWrapper as HTMLElement).style.position = 'relative';
      }
      
      // Create actual button element for the clear functionality
      const clearButton = document.createElement('button');
      clearButton.className = 'ag-filter-clear-button';
      clearButton.textContent = 'x';
      clearButton.title = 'Clear filter';
      clearButton.type = 'button';
      clearButton.style.display = input.value ? 'block' : 'none';
      
      // Add the button to the input wrapper instead of the container
      inputWrapper.appendChild(clearButton);
      
      // Setup input event listeners with debouncing
      const handleInput = this.debounce(() => {
        clearButton.style.display = input.value ? 'block' : 'none';
      }, 100);
      
      this.addEventListenerWithTracking(input, 'input', handleInput);
      
      // Function to clear the filter
      const clearFilter = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Clearing filter for column:', columnId);
        
        try {
          if (this.gridApi) {
            // Get the current filter model
            const currentFilterModel = this.gridApi.getFilterModel();
            
            // Remove only this column's filter
            if (currentFilterModel && currentFilterModel[columnId]) {
              delete currentFilterModel[columnId];
              this.gridApi.setFilterModel(currentFilterModel);
            }
            
            // Clear the input value
            input.value = '';
            
            // Hide the clear button
            clearButton.style.display = 'none';
            
            // Dispatch input event to trigger filter update
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
          }
        } catch (error) {
          console.error('Error clearing filter:', error);
        }
      };
      
      // Setup click handler for the clear button
      this.addEventListenerWithTracking(clearButton, 'click', clearFilter);
      this.addEventListenerWithTracking(clearButton, 'touchend', clearFilter);
    });
  }
  
  /**
   * Find the parent column element for a floating filter
   */
  private findParentColumn(element: Element): Element | null {
    let current = element;
    for (let i = 0; i < 5; i++) { // Limit depth to avoid infinite loop
      const parent = current.parentElement;
      if (!parent) return null;
      
      if (parent.classList.contains('ag-header-cell') || 
          parent.hasAttribute('col-id')) {
        return parent;
      }
      current = parent;
    }
    return null;
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
  }
}
