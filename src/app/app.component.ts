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
  ColumnPinnedEvent,
  ColGroupDef
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
    /* Overall app layout */
    :host {
      display: block;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      gap: 25px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Page title */
    .app-title {
      margin: 0 0 15px 0;
      font-size: 24px;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    /* Column management section */
    .column-management {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 25px;
    }

    .column-management h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 500;
      color: #444;
    }

    /* Column control buttons */
    .column-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .column-controls button {
      padding: 10px 16px;
      border: 1px solid #ddd;
      background-color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      font-size: 14px;
      color: #555;
    }

    .column-controls button:hover {
      background-color: #f0f0f0;
      border-color: #ccc;
      color: #333;
    }
    
    .column-controls button:active {
      background-color: #e5e5e5;
      transform: translateY(1px);
    }
    
    /* Grid container */
    .grid-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      height: 600px;
    }
    
    /* Minimal floating filter styling - just enough to ensure proper padding for the clear button */
    .ag-floating-filter-input,
    .ag-floating-filter-body input {
      padding-right: 24px !important;
    }
    
    /* Clear button as a real button element - with minimal styles to not interfere with default AG Grid styling */
    .ag-filter-clear-button {
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      opacity: 0.6;
      transition: opacity 0.2s;
      z-index: 50;
      width: 16px;
      height: 16px;
      line-height: 14px;
      text-align: center;
      background: transparent;
      border-radius: 50%;
      border: none;
      padding: 0;
      margin: 0;
      display: none;
    }
    
    .ag-filter-clear-button:hover {
      opacity: 1;
      background: rgba(0,0,0,0.05);
    }
    
    /* Theme-specific styles for clear button */
    .ag-theme-quartz .ag-filter-clear-button,
    .ag-theme-quartz-light .ag-filter-clear-button {
      color: #333;
    }
    
    .ag-theme-quartz-dark .ag-filter-clear-button,
    .ag-theme-alpine-dark .ag-filter-clear-button,
    .ag-theme-balham-dark .ag-filter-clear-button {
      color: #fff;
      opacity: 0.8;
    }
    
    /* Dark theme hover improvement */
    .ag-theme-quartz-dark .ag-filter-clear-button:hover,
    .ag-theme-alpine-dark .ag-filter-clear-button:hover,
    .ag-theme-balham-dark .ag-filter-clear-button:hover {
      opacity: 1;
      background: rgba(255,255,255,0.15);
    }
    
    /* For Material theme */
    .ag-theme-material .ag-filter-clear-button {
      color: rgba(0, 0, 0, 0.87);
    }
    
    .ag-theme-material-dark .ag-filter-clear-button {
      color: rgba(255, 255, 255, 0.87);
      opacity: 0.8;
    }
    
    .ag-theme-material-dark .ag-filter-clear-button:hover {
      opacity: 1;
      background: rgba(255,255,255,0.15);
    }
    
    /* AG Grid theme customizations */
    .ag-theme-quartz {
      --ag-header-height: 40px;
      --ag-header-foreground-color: #333;
      --ag-header-background-color: #f5f5f5;
      --ag-header-cell-hover-background-color: #ececec;
      --ag-row-hover-color: #f0f7ff;
      --ag-selected-row-background-color: #e5f2ff;
      --ag-font-size: 14px;
      --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      --ag-border-color: #dde2eb;
    }
  `],
  template: /* html */ `
    <div class="app-container">
      <h1 class="app-title">AG Grid Data Explorer</h1>
      
      <div class="column-management">
        <h3>Column Management</h3>
        <div class="column-controls">
          <button id="btn-add-column">Add Regular Column</button>
          <button id="btn-remove-last-column">Remove Last Column</button>
          <button id="btn-add-column-group">Add Column Group</button>
          <button id="btn-add-to-group">Add Column to Group</button>
          <button id="btn-remove-from-group">Remove Column from Group</button>
          <button id="btn-reset-columns">Reset Columns</button>
        </div>
      </div>

      <div class="grid-container">
        <ag-grid-angular
          class="ag-theme-quartz"
          style="width: 100%; height: 100%;"
          [rowData]="rowData"
          [columnDefs]="colDefs"
          [defaultColDef]="defaultColDef"
          [statusBar]="statusBar"
          [sideBar]="sideBar"
          (gridReady)="onGridReady($event)"
        >
        </ag-grid-angular>
      </div>
    </div>
  `,
})
export class AppComponent implements OnDestroy {
  private gridApi: GridApi | null = null;
  private eventListeners: Array<{ element: Element; type: string; listener: EventListener }> = [];
  private timeoutId: any = null;
  private gridInitialized = false;
  private columnCounter = 0;
  private originalColDefs: (ColDef | ColGroupDef)[] = [];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000, year: 2010, color: 'Red', mileage: 50000, engine: 'V4', transmission: 'Automatic' },
    { make: 'Ford', model: 'Mondeo', price: 32000, year: 2012, color: 'Blue', mileage: 65000, engine: 'V6', transmission: 'Manual' },
    { make: 'Porsche', model: 'Boxster', price: 72000, year: 2015, color: 'Black', mileage: 30000, engine: 'V6', transmission: 'Automatic' },
    { make: 'Honda', model: 'Civic', price: 22000, year: 2018, color: 'White', mileage: 25000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Toyota', model: 'Camry', price: 25000, year: 2019, color: 'Silver', mileage: 22000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'BMW', model: '3 Series', price: 42000, year: 2020, color: 'Blue', mileage: 18000, engine: 'Inline-6', transmission: 'Automatic' },
    { make: 'Mercedes', model: 'C-Class', price: 46000, year: 2021, color: 'Black', mileage: 15000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Audi', model: 'A4', price: 40000, year: 2019, color: 'White', mileage: 20000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Volkswagen', model: 'Golf', price: 28000, year: 2020, color: 'Gray', mileage: 22000, engine: 'Inline-4', transmission: 'Manual' },
    { make: 'Tesla', model: 'Model 3', price: 48000, year: 2021, color: 'Red', mileage: 10000, engine: 'Electric', transmission: 'Automatic' },
    { make: 'Hyundai', model: 'Tucson', price: 26000, year: 2018, color: 'Blue', mileage: 35000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Kia', model: 'Sportage', price: 25000, year: 2019, color: 'White', mileage: 30000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Mazda', model: 'CX-5', price: 27000, year: 2020, color: 'Red', mileage: 25000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Subaru', model: 'Forester', price: 29000, year: 2018, color: 'Green', mileage: 40000, engine: 'Flat-4', transmission: 'CVT' },
    { make: 'Nissan', model: 'Altima', price: 24000, year: 2019, color: 'Black', mileage: 35000, engine: 'Inline-4', transmission: 'CVT' },
    { make: 'Chevrolet', model: 'Malibu', price: 23000, year: 2020, color: 'Silver', mileage: 30000, engine: 'Inline-4', transmission: 'Automatic' },
    { make: 'Ford', model: 'Focus', price: 21000, year: 2018, color: 'Blue', mileage: 45000, engine: 'Inline-3', transmission: 'Automatic' },
    { make: 'Toyota', model: 'Corolla', price: 20000, year: 2019, color: 'White', mileage: 38000, engine: 'Inline-4', transmission: 'CVT' },
    { make: 'Honda', model: 'Accord', price: 27000, year: 2020, color: 'Black', mileage: 28000, engine: 'Inline-4', transmission: 'CVT' },
    { make: 'Lexus', model: 'ES', price: 45000, year: 2021, color: 'Silver', mileage: 15000, engine: 'V6', transmission: 'Automatic' }
  ];

  colDefs: (ColDef | ColGroupDef)[] = [
    { field: 'make', filter: 'agMultiColumnFilter', floatingFilter: true, filterParams: {
      filters: [
        {
          filter: "agTextColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams},
    { field: 'model', filter: 'agMultiColumnFilter', floatingFilter: true, filterParams: {
      filters: [
        {
          filter: "agTextColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams },
    { field: 'price', filter: 'agMultiColumnFilter', floatingFilter: true, filterParams: {
      filters: [
        {
          filter: "agNumberColumnFilter",
        },
        {
          filter: "agSetColumnFilter",
        },
      ],
    } as IMultiFilterParams},
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

  sideBar = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      }
    ],
    defaultToolPanel: 'columns'
  };

  /**
   * Called when the grid is ready
   */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    
    // Store original column definitions
    this.originalColDefs = [...this.colDefs];
    
    // Clear any existing timeout to prevent memory leaks
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Set grid as initialized
    this.gridInitialized = true;

    // Ensure the floating filters are enabled
    console.log('Grid ready, setting up floating filters');
    
    // After grid is ready, setup filter events with increased timeout
    // to ensure the DOM is fully rendered
    this.timeoutId = setTimeout(() => {
      console.log('Setting up filter events after delay');
      this.setupFilterEvents();
    }, 800);

    // Set up button event listeners programmatically
    this.setupButtonEventListeners();
    
    // Set up grid event listeners programmatically
    this.setupGridEventListeners();
  }

  /**
   * Set up event listeners for all buttons
   */
  private setupButtonEventListeners(): void {
    // Add column button
    const addColumnBtn = document.getElementById('btn-add-column');
    if (addColumnBtn) {
      this.addEventListenerWithTracking(addColumnBtn, 'click', () => this.addColumn());
    }
    
    // Remove last column button
    const removeLastColumnBtn = document.getElementById('btn-remove-last-column');
    if (removeLastColumnBtn) {
      this.addEventListenerWithTracking(removeLastColumnBtn, 'click', () => this.removeLastColumn());
    }
    
    // Add column group button
    const addColumnGroupBtn = document.getElementById('btn-add-column-group');
    if (addColumnGroupBtn) {
      this.addEventListenerWithTracking(addColumnGroupBtn, 'click', () => this.addColumnGroup());
    }
    
    // Add column to group button
    const addToGroupBtn = document.getElementById('btn-add-to-group');
    if (addToGroupBtn) {
      this.addEventListenerWithTracking(addToGroupBtn, 'click', () => this.addColumnToGroup());
    }
    
    // Remove column from group button
    const removeFromGroupBtn = document.getElementById('btn-remove-from-group');
    if (removeFromGroupBtn) {
      this.addEventListenerWithTracking(removeFromGroupBtn, 'click', () => this.removeColumnFromGroup());
    }
    
    // Reset columns button
    const resetColumnsBtn = document.getElementById('btn-reset-columns');
    if (resetColumnsBtn) {
      this.addEventListenerWithTracking(resetColumnsBtn, 'click', () => this.resetColumns());
    }
  }
  
  /**
   * Set up event listeners for grid events
   */
  private setupGridEventListeners(): void {
    if (!this.gridApi) return;
    
    // Add event listeners for column events
    this.gridApi.addEventListener('columnMoved', (event) => this.onColumnEvent(event));
    this.gridApi.addEventListener('columnResized', (event) => this.onColumnEvent(event));
    this.gridApi.addEventListener('columnVisible', (event) => this.onColumnEvent(event));
    this.gridApi.addEventListener('columnPinned', (event) => this.onColumnEvent(event));
  }

  /**
   * Add a new column with the same filter configuration
   */
  addColumn() {
    this.columnCounter++;
    const newField = `dynamicField${this.columnCounter}`;
    const newColumn: ColDef = {
      field: newField,
      headerName: `Dynamic Column ${this.columnCounter}`,
      filter: 'agMultiColumnFilter',
      floatingFilter: true,
      filterParams: {
        filters: [
          {
            filter: "agTextColumnFilter",
          },
          {
            filter: "agSetColumnFilter",
          },
        ],
      } as IMultiFilterParams,
    };
    
    // Add random data to the rows for this column
    this.addRandomDataToRows(newField);
    
    // Add the column to the grid
    this.colDefs = [...this.colDefs, newColumn];
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After adding the column, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Remove the last added column
   */
  removeLastColumn() {
    if (this.colDefs.length <= 3) {
      console.log('Cannot remove base columns');
      return;
    }
    
    this.colDefs = this.colDefs.slice(0, -1);
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After removing the column, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Add a column group with child columns
   */
  addColumnGroup() {
    this.columnCounter++;
    const groupId = `group${this.columnCounter}`;
    
    // Create child columns for the group
    const childColumns: ColDef[] = [];
    for (let i = 1; i <= 2; i++) {
      const childField = `${groupId}_child${i}`;
      childColumns.push({
        field: childField,
        headerName: `Group ${this.columnCounter} Column ${i}`,
        filter: 'agMultiColumnFilter',
        floatingFilter: true,
        filterParams: {
          filters: [
            {
              filter: "agTextColumnFilter",
            },
            {
              filter: "agSetColumnFilter",
            },
          ],
        } as IMultiFilterParams,
      });
      
      // Add random data for this column
      this.addRandomDataToRows(childField);
    }
    
    // Create the column group
    const columnGroup: ColGroupDef = {
      headerName: `Group ${this.columnCounter}`,
      children: childColumns,
    };
    
    // Add the column group to the grid
    this.colDefs = [...this.colDefs, columnGroup];
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After adding the column group, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Add a new column to an existing group
   */
  addColumnToGroup() {
    // Find the first column group
    const groupIndex = this.colDefs.findIndex(col => (col as ColGroupDef).children !== undefined);
    
    if (groupIndex === -1) {
      console.log('No column groups found. Please add a column group first.');
      return;
    }
    
    const columnGroup = this.colDefs[groupIndex] as ColGroupDef;
    const groupChildren = columnGroup.children || [];
    
    // Create a new child column
    this.columnCounter++;
    const childField = `${columnGroup.headerName?.replace(/\s+/g, '')}_child${groupChildren.length + 1}`;
    const newChildColumn: ColDef = {
      field: childField,
      headerName: `New Child ${this.columnCounter}`,
      filter: 'agMultiColumnFilter',
      floatingFilter: true,
      filterParams: {
        filters: [
          {
            filter: "agTextColumnFilter",
          },
          {
            filter: "agSetColumnFilter",
          },
        ],
      } as IMultiFilterParams,
    };
    
    // Add random data for this column
    this.addRandomDataToRows(childField);
    
    // Add the new child to the group
    columnGroup.children = [...groupChildren, newChildColumn];
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After adding the column to the group, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Remove a column from an existing group
   */
  removeColumnFromGroup() {
    // Find the first column group
    const groupIndex = this.colDefs.findIndex(col => (col as ColGroupDef).children !== undefined);
    
    if (groupIndex === -1) {
      console.log('No column groups found. Please add a column group first.');
      return;
    }
    
    const columnGroup = this.colDefs[groupIndex] as ColGroupDef;
    const groupChildren = columnGroup.children || [];
    
    if (groupChildren.length <= 1) {
      console.log('Cannot remove the last column from a group.');
      return;
    }
    
    // Remove the last child from the group
    columnGroup.children = groupChildren.slice(0, -1);
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After removing the column from the group, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Reset columns to original state
   */
  resetColumns() {
    this.columnCounter = 0;
    this.colDefs = [...this.originalColDefs];
    
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
      
      // After resetting the columns, refresh the filter buttons
      this.refreshFilterButtons();
    }
  }

  /**
   * Add random data to the rows for a specific field
   */
  private addRandomDataToRows(field: string) {
    const values = ['Value A', 'Value B', 'Value C', 'Value D', 'Value E'];
    
    this.rowData = this.rowData.map(row => {
      return {
        ...row,
        [field]: values[Math.floor(Math.random() * values.length)]
      };
    });
    
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  /**
   * Refresh the filter buttons after column changes
   */
  private refreshFilterButtons() {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Use a timeout to ensure the DOM has been updated
    this.timeoutId = setTimeout(() => {
      console.log('Refreshing filter buttons');
      this.cleanupExistingEvents();
      this.setupFilterEvents();
      
      // Force grid to refresh floating filters by updating column defs
      if (this.gridApi) {
        // Refresh the header to ensure proper rendering
        this.gridApi.refreshHeader();
        
        // Force a full refresh of column definitions to ensure floating filters are shown
        const currentColDefs = [...this.colDefs];
        this.gridApi.setGridOption('columnDefs', currentColDefs);
      }
    }, 300);
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
    // Only remove event listeners related to filter inputs and clear buttons
    this.eventListeners = this.eventListeners.filter(({ element, type, listener }) => {
      const isFilterInput = element.tagName === 'INPUT' && 
                            element.closest('.ag-floating-filter-body');
      const isClearButton = element.classList.contains('ag-filter-clear-button');
      
      if (isFilterInput || isClearButton) {
        element.removeEventListener(type, listener);
        return false; // Remove from array
      }
      return true; // Keep in array
    });
    
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
