import React, {Component, ReactNode, ComponentClass} from 'react';
import Item from './Item';
import renderColumns from './ColumnIterator';
import renderColumn from './ColumnRenderer';
import _ from 'lodash';
import './index.css';
import { Column, Id } from './types';

/**
 * @typedef Column
 * @property {string} id - column identifier
 * @property {string} [label] - column header label
 * @property {function|string} [property] - string for column path or function that takes item and returns value
 * @property {function} [formatter] - function that takes value and item as parameter and formats cell content
 */

/**
 * @name onMount
 * @function
 * @param {AsteriskTable} component
 */

/**
 * @name resolveItems
 * @function
 * @param {array} items
 * @returns {array} resolved items
 */

 /**
 * @typedef AsteriskTableProps
 * @property {array} items - table items
 * @property {array} columns - table columns
 * @property {object} [table_props] - props to append to table tag
 * @property {object} [Item=Item] - custom row item
 * @property {resolveItems} [resolveItems] - function for resolving items
 * @property {renderColumns} [renderColumns=renderColumns] - function for rendering thead content
 * @property {onMount} [onMount] - function to be called on component mount with component as param
 */

export interface AsteriskTableProps {
  columns: any[];
  items: any[];
  onMount?: Function;
  renderColumns?: Function;
  renderColumn?: Function;
  resolveItems?: Function;
  Item?: ComponentClass<any>;
  tableProps?: any;
  columnProps?: any;
  onColumnTitleClick?: Function;
}

/**
 * Extendable React table component
 * 
 * @property {AsteriskTableProps} props
 * @class
 */
class AsteriskTable extends Component<AsteriskTableProps> {
  public static defaultProps = {
    renderColumns,
    renderColumn,
    Item
  }
  constructor(props: AsteriskTableProps) {
    super(props);

    this.getContent = this.getContent.bind(this);
  }
  /**
   * Gives this component for any higher component asking for it
   */
  componentDidMount() {
    this.props.onMount && this.props.onMount(this);
  }
  /**
   * Gets value for item's column.
   * If column property is function, then execute it with item as parameter.
   * If column property is string, use it to get one- or multi-dimensional field.
   * Otherwise use column id.
   * 
   * @param {object} item 
   * @param {Column} column 
   * @returns {string} value
   */
  getValue(item: any, column: Column) {
    if (!item || !column) {
      return;
    }
    let value;
    if (typeof column.property == 'function') {
      value = column.property(item);
    }
    else if (typeof column.property == 'string') {
      value = _.get(item, column.property);
    }
    else {
      value = _.get(item, column.id);
    }
    return value;
  }
  /**
   * Gets cell content for item's column.
   * Gets column value from getValue and
   * then uses column formatter with value and item as parameters.
   * 
   * @param {object} item 
   * @param {Column} column 
   * @returns {string} content
   */
  getContent(item: any, column: Column) {
    let value = this.getValue(item, column);
    let content = typeof column.formatter == 'function' && column.formatter(value, item) || value;
    return content;
  }
  getColumnById(id: Id) {
    let found_column;
    const find = (columns: Column[]) => columns.forEach((column: Column) => {
      if (column.id === id) {
        found_column = column;
      }
      else if (column.columns && column.columns.length) {
        find(column.columns);
      }
    });
    find(this.props.columns);
    return found_column;
  }
  render() {
    const {renderColumns, resolveItems, Item, items} = this.props;
    const renderedColumns = renderColumns(this.props);
    const TableItem = Item;

    let resolvedItems = this.props.resolveItems ? _.memoize((items) => resolveItems(items))(items) : this.props.items;

    return (
      <table className="asterisk-table" {...this.props.tableProps}>
        {renderedColumns}
        <tbody>
          {resolvedItems && resolvedItems.map((item: any, index: number) =>
            <TableItem
              {...this.props}
              key={item.id}
              index={index}
              item={item}
              getContent={this.getContent}
              depth={0}
            />
          )}
        </tbody>
      </table>
    );
  }
}

export default AsteriskTable;