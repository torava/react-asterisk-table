/**
 * @module SortableColumnRenderer
 */

import React from 'react';
import './SortableColumnRenderer.css';
import PropTypes from 'prop-types';

/**
 * AsteriskTable function that returns sortable column
 * 
 * @param {Column} column
 * @param {props} props 
 */
function renderColumn(column, props) {
  return (
    <th {...props.column_props}
        key={column.id}
        onClick={event => props.onColumnTitleClick && props.onColumnTitleClick(event, column)}>
      {column.label}
      <span className={'column-order '+(props.column_orders && {'ASC': 'asc', 'DESC': 'desc' || ''}[props.column_orders[column.id]] || '')}></span>
    </th>
  );
}

renderColumn.propTypes = {
  column_props: PropTypes.object,
  onColumnTitleClick: PropTypes.func,
  column_orders: PropTypes.object
};

export default renderColumn;