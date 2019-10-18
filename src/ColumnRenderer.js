/**
 * @module ColumnRenderer
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * AsteriskTable function that returns column
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
    </th>
  );
}

renderColumn.propTypes = {
  column_props: PropTypes.object,
  onColumnTitleClick: PropTypes.func
};

export default renderColumn;