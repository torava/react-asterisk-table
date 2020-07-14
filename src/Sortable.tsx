/**
 * @module Sortable
 */

import React from 'react';
import renderColumn from './SortableColumnRenderer';
import AsteriskTable, { AsteriskTableProps } from '.';
import { Id, Column } from './types';

interface SortableColumn extends Column {
  sortable?: boolean
}

export enum ColumnOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SortableTableProps extends AsteriskTableProps {
  columnOrders: Record<Id, ColumnOrder>
}

export default function sortable(WrappedComponent: React.ComponentClass<any>): React.ComponentClass<any> {
  interface SortableProps extends AsteriskTableProps {
    sortItems: Function;
    onMount: Function
  }
  interface SortableState {
    columnOrders: Record<Id, ColumnOrder>
  }

  /**
   * AsteriskTable HOC component for making it sortable from column click.
   * 
   * @class
   */
  class Sortable extends React.Component<SortableProps, SortableState> {
    wrappedComponent: AsteriskTable;
    tableRef: React.RefObject<React.Component> = React.createRef();

    constructor(props: SortableProps) {
      super(props);

      this.toggleColumnOrder = this.toggleColumnOrder.bind(this);

      this.state = {
        columnOrders: {}
      };
    }
    /**
     * @returns AsteriskTable component
     */
    getWrappedComponent() {
      return this.wrappedComponent;
    }
    /**
     * @returns Inner HOC component or AsteriskTable component
     */
    getRef() {
      return this.tableRef;
    }
    /**
     * Toggles sorting order for given column.
     * Order is switched between ascending, descending and no order. 
     */
    toggleColumnOrder(event: MouseEvent, column: SortableColumn) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('no-action')) return;

      if (column.sortable === false) return;

      let columnOrders = {...this.state.columnOrders};
      
      if (columnOrders[column.id] == ColumnOrder.ASC) {
        columnOrders[column.id] = ColumnOrder.DESC;
      }
      else if (columnOrders[column.id] == ColumnOrder.DESC) {
        delete columnOrders[column.id];
      }
      else {
        columnOrders[column.id] = ColumnOrder.ASC;
      }
      
      this.setState({columnOrders});
    }
    /**
     * Sorts items by chosen columns in defined order.
     * Items with empty values will be below.
     * Uses user-defined sort function if sortItems is provided as props.
     * Used as resolver function in resolveItems props before other defined resolvers.
     */
    sortItems(items: any[]) {
      if (this.props.sortItems && typeof this.props.sortItems === 'function') return this.props.sortItems(items, this.state.columnOrders);

      if (!items || !items.length) return [];

      let resolvedItems = [...items],
          columnOrders = this.state ? this.state.columnOrders : {},
          collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}),
          columnOrder,
          order,
          a,
          b,
          column;

      resolvedItems.sort((aItem, bItem) => {
        for (let id in columnOrders) {
          column = this.wrappedComponent.getColumnById(id);
          a = this.wrappedComponent.getValue(aItem, column);
          b = this.wrappedComponent.getValue(bItem, column);

          if (a === null || typeof a == 'undefined' || a === '') {
            return 1;
          }
          else if (b === null || typeof b == 'undefined' || b === '') {
            return -1;
          }
          else if (a === b) {
            order = 0;
          }
          else if (typeof a == 'string' || typeof b == 'string') {
            order = collator.compare(String(a), String(b));
          }
          else {
            order = a > b ? 1 : -1;
          }

          columnOrder = columnOrders[id];
          if (columnOrder === ColumnOrder.ASC) {
            return order;
          }
          else if (columnOrder === ColumnOrder.DESC) {
            if (order == 1) {
              return -1;
            }
            else if (order === -1) {
              return 1;
            }
            else {
              return 0;
            }
          }
        }
      });

      return resolvedItems;
    }
    render() {
      const resolve = (items: any[]) => {
        let sorted = this.sortItems(items);
        return this.props.resolveItems ? this.props.resolveItems(sorted) : sorted;
      };

      return <WrappedComponent
        {...this.props}
        onMount={(wrappedComponent: AsteriskTable) => { this.wrappedComponent = wrappedComponent }}
        ref={this.tableRef}
        onColumnTitleClick={this.toggleColumnOrder}
        resolveItems={resolve}
        columnOrders={this.state.columnOrders}
        items={this.props.items}
        renderColumn={renderColumn}/>;
    }
  }

  /**
   * @typedef {props} props
   * @property {items} array
   * @property {columns} array
   * @property {function} resolveItems
   * @property {function} sortItems - custom sorting function
   */

  return Sortable;
}