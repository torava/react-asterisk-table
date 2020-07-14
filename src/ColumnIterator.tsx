import React from 'react';
import { AsteriskTableProps } from '.';

/**
 * AsteriskTable function that iterates columns to be rendered to thead
 * 
 * @name renderColumns
 * @function
 * @param {props} props
 */
function renderColumns(props: AsteriskTableProps) {
  let cols = props.columns.map(column => (
                                      <col key={'col-'+column.id}
                                           style={column.style}/>
                                    )),
      column_ths = props.columns.map(column => props.renderColumn(column, props));

  return [
    <colgroup key="colgroup">
      {cols}
    </colgroup>,
    <thead key="thead">
      <tr>
        {column_ths}
      </tr>
    </thead>
  ];
}

export default renderColumns;