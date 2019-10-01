import React from 'react';
import '../css/SortableColumns.css';

export default function renderColumns(props) {
  let cols = props.columns.map(column => (
                                      <col key={'col-'+column.id}
                                           style={column.style}/>
                                    )),
      column_ths = props.columns.map(column => (
                                            <th key={column.id}
                                                onClick={event => props.onColumnTitleClick && props.onColumnTitleClick(event, column)}
                                                >
                                              {column.label}&nbsp;
                                              <span className={'column-order '+(props.column_orders && {'ASC': 'asc', 'DESC': 'desc' || ''}[props.column_orders[column.id]] || '')}></span>
                                            </th>
                                          ));

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