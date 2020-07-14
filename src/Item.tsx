/**
 * @module Item
 */

import React, {Component} from 'react';
import { Column } from './types';

export interface ItemProps {
  item: any;
  columns: Column[];
  getContent: Function;
  trProps?: any;
  tdProps?: any;
}

/**
 * AsteriskTable component that renders item row and its columns
 * 
 * @class
 */
class Item extends Component<ItemProps> {
  constructor(props: ItemProps) {
    super(props);
  }
  /**
   * Pushes renderable columns to tds parameter from columns parameter
   * 
   * @param {array} columns 
   * @param {array} tds 
   */
  renderItemColumns(columns: Column[], tds: any[]) {
    let content,
        key,
        columnHasChildren;
    
    if (columns && columns.length) {
      return columns.map(column => {
        columnHasChildren = column.columns && column.columns.length;
        if (columnHasChildren) {
          this.renderItemColumns(column.columns, tds);
        }
        else {
          content = this.props.getContent(this.props.item, column);

          key = 'td-row-'+this.props.item.id+'-column-'+column.id;

          tds.push(<td className={column.class ? ' '+column.class : ''}
                       key={key}
                       {...this.props.tdProps}>
                       {content}
                  </td>);
        }
      });
    }
  }

  render() {
    let tds: any[] = [];

    this.renderItemColumns(this.props.columns, tds);

    let row = (
      <tr key={'tr-row-'+this.props.item.id}
          id={this.props.item.id}
          {...this.props.trProps}>
        {tds}
      </tr>
    );

    return row;
  }
}

export default Item;