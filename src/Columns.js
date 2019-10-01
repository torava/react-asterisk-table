import React from 'react';

/**
 * AsteriskTable function that renders columns to thead
 * 
 * @param {object} props 
 */
function renderColumns(props) {
  let cols = props.columns.map(column => (
                                      <col key={'col-'+column.id}
                                           style={column.style}/>
                                    )),
      column_ths = props.columns.map(column => (
                                            <th key={column.id}
                                                onClick={event => props.onColumnTitleClick && props.onColumnTitleClick(event, column)}>
                                              {column.label}
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

export default renderColumns;