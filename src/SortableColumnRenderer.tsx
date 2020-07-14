/**
 * @module SortableColumnRenderer
 */

import React from 'react';
import './SortableColumnRenderer.css';
import { Column } from './types';
import { SortableTableProps } from './Sortable';

/**
 * AsteriskTable function that returns sortable column
 * 
 * @param {Column} column
 * @param {props} props 
 */
function renderColumn(column: Column, props: SortableTableProps) {
  return (
    <th {...props.columnProps}
        key={column.id}
        onClick={event => props.onColumnTitleClick && props.onColumnTitleClick(event, column)}>
      {column.label}
      <span className={'column-order '+(props.columnOrders && props.columnOrders[column.id] || '')}></span>
    </th>
  );
}

export default renderColumn;