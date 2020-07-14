/**
 * @module ColumnRenderer
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Column } from './types';
import { AsteriskTableProps } from '.';

/**
 * AsteriskTable function that returns column
 * 
 * @param {Column} column
 * @param {props} props 
 */
function renderColumn(column: Column, props: AsteriskTableProps) {
  return (
    <th {...props.columnProps}
        key={column.id}
        onClick={event => props.onColumnTitleClick && props.onColumnTitleClick(event, column)}>
      {column.label}
    </th>
  );
}

export default renderColumn;