import React, {Component} from 'react';
import Item from './Item';
import renderColumns from './ColumnIterator';
import renderColumn from './Column';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './index.css';

/**
 * Extendable React table component
 * 
 * @class
 */
class AsteriskTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      column_orders: {},
      expanded_items: {},
      ready: false
    };

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
   * @param {object} column 
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
   * @param {object} column 
   * @returns {string} content
   */
  getContent(item, column) {
    let value = this.getValue(item, column);
    let content = column.formatter && column.formatter(value, item) || value;
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
              filter={this.state.filter}
              getContent={this.getContent}
              depth={0}
            />
          )}
        </tbody>
      </table>
    );
  }
}
AsteriskTable.defaultProps = {
  renderColumn,
  renderColumns
};

AsteriskTable.propTypes = {
  table_props: PropTypes.object,
  Item: PropTypes.func,
  items: PropTypes.array,
  expanded_items: PropTypes.object,
  columns: PropTypes.array,
  resolveItems: PropTypes.func,
  renderColumns: PropTypes.func,
  toggleChildren: PropTypes.func,
  childView: PropTypes.func,
  onMount: PropTypes.func,
  getColumns: PropTypes.func
};

export default AsteriskTable;