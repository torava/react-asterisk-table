/**
 * @module NestedColumnIterator
 */

import React, {ReactElement} from 'react';
import './NestedColumnIterator.css';
import { AsteriskTableProps } from '.';

/**
 * AsteriskTable function that iterates nested columns to be rendered to thead.
 * If column has columns field, then nested columns will be shown below their parent column.
 * 
 * @param {props} props 
 */
function renderColumns(props: AsteriskTableProps) {
  let cols: ReactElement[] = [];
  let content: ReactElement[][] = [];

  function renderNested(columns: any[], content: ReactElement[][], cols: ReactElement[], depth: number = 0) {
    let count,
        count2 = 0,
        rowspan;

    columns && columns.map(column => {
      count = 0;
      rowspan = 1;
      if (column.columns) {
        count = Math.max(renderNested(column.columns, content, cols, depth+1), column.columns.length);
      }
      else {
        rowspan = depth;
        cols.push(<col key={column.id} style={column.style}/>);
      }
      if (!content[depth]) content[depth] = [];
      content[depth].push(props.renderColumn(column, {...props,
        columnProps: {
          ...props.columnProps,
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

  renderNested(props.columns, content, cols);

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