import React, {Component} from 'react';
import Item from './Item';
import renderColumns from './ColumnIterator';
import renderColumn from './ColumnRenderer';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './index.css';

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
 * Extendable React table component
 * 
 * @property {props} props
 * @class
 */
class AsteriskTable extends Component {
  constructor(props) {
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
  getValue(item, column) {
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
  getContent(item, column) {
    let value = this.getValue(item, column);
    let content = typeof column.formatter == 'function' && column.formatter(value, item) || value;
    return content;
  }
  getColumnById(id) {
    let found_column;
    const find = columns => columns.forEach(column => {
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
    let rendered_columns = this.props.renderColumns(this.props);

    let TableItem = this.props.Item || Item;

    let items = this.props.resolveItems ? this.props.resolveItems(this.props.items) : this.props.items;

    return (
      <table className="asterisk-table" {...this.props.table_props}>
        {rendered_columns}
        <tbody>
          {items && items.map((item, index) =>
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

/**
 * @typedef props
 * @property {array} items - table items
 * @property {array} columns - table columns
 * @property {object} [table_props] - props to append to table tag
 * @property {function} [Item] - custom row item
 * @property {function} [resolveItems] - function for resolving items
 * @property {renderColumns} [renderColumns=renderColumns] - function for rendering thead content
 * @property {onMount} [onMount] - function to be called on component mount with component as param
 */

AsteriskTable.propTypes = {
  items: PropTypes.array,
  columns: PropTypes.array,
  table_props: PropTypes.object,
  Item: PropTypes.func,
  resolveItems: PropTypes.func,
  renderColumns: PropTypes.func,
  onMount: PropTypes.func
};

AsteriskTable.defaultProps = {
  renderColumn,
  renderColumns
};

export default AsteriskTable;