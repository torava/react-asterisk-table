/**
 * @module NestedColumnIterator
 */

import React from 'react';
import './NestedColumnIterator.css';

/**
 * AsteriskTable function that iterates nested columns to be rendered to thead.
 * If column has columns field, then nested columns will be shown below their parent column.
 * 
 * @param {object} props 
 */
function renderColumns(props) {
  let cols = [];
  let content = [];

  function renderNested(columns, content, depth, cols) {
    let count,
        count2 = 0,
        rowspan;

    columns && columns.visible !== false && columns.map(column => {
      count = 0;
      rowspan = 1;
      if (column.columns) {
        count = Math.max(renderNested(column.columns, content, depth+1, cols), column.columns.length);
      }
      else {
        rowspan = depth;
        cols.push(<col key={column.id} style={column.style}/>);
      }
      if (!content[depth]) content[depth] = [];
      content[depth].push(props.renderColumn(column, {...props,
        column_props: {
          ...props.column_props,
          colSpan: count || 1,
          rowSpan: rowspan,
          className: depth === 0 && column.columns ? 'parent no-action' : null,
          'data-depth': depth
        }
      }));
      count2+= count;
    });
    return count2;
  }

  renderNested(props.columns, content, 0, cols);

  return [
    <colgroup key="colgroup">
      {cols}
    </colgroup>,
    <thead key="thead">
      {content.map((row, i) => <tr key={'row'+i}>{row}</tr>)}
    </thead>
  ];
}

export default renderColumns;