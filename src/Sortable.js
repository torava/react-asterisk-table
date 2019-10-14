import React, {Component} from 'react';
import PropTypes from 'prop-types';
import renderColumns from './SortableColumns';

export default function sortable(WrappedComponent) {
  /**
   * AsteriskTable HOC component for making it sortable from column click.
   * 
   * @class
   */
  class Sortable extends Component {
    constructor(props) {
      super(props);

      this.toggleColumnOrder = this.toggleColumnOrder.bind(this);

      this.resolve = items => {
        let sorted = this.sortItems(items);
        return this.props.resolveItems ? this.props.resolveItems(sorted) : sorted;
      };

      this.state = {
        column_orders: {}
      };

      this.table_ref = React.createRef();
    }
    /**
     * @returns {React.Element} AsteriskTable component
     */
    getWrappedComponent() {
      return this.wrapped_component;
    }
    /**
     * @returns {React.Element} Inner HOC component or AsteriskTable component
     */
    getRef() {
      return this.table_ref;
    }
    /**
     * Toggles sorting order for given column.
     * Order is switched between ascending, descending and no order.
     * 
     * @param {object} column 
     */
    toggleColumnOrder(event, column) {
      if (event.target.classList.contains('no-action')) return;

      if (column.sortable === false) return;

      let column_orders = {...this.state.column_orders};
      
      if (column.sortable !== false) {
        if (column_orders[column.id] == 'ASC') {
          column_orders[column.id] = 'DESC';
        }
        else if (column_orders[column.id] == 'DESC') {
          delete column_orders[column.id];
        }
        else {
          column_orders[column.id] = 'ASC';
        }
      }
      
      this.setState({column_orders});
    }
    /**
     * Sorts items by chosen columns in defined order.
     * Items with empty values will be below.
     * Uses user-defined sort function if sortItems is provided as props.
     * Used as resolver function in resolveItems props before other defined resolvers.
     * 
     * @param {array} items
     */
    sortItems(items) {
      if (this.props.sortItems && typeof this.props.sortItems === 'function') return this.props.sortItems(items, this.state.column_orders);

      if (!items || !items.length) return [];

      let resolved_items = [...items],
          column_orders = this.state ? this.state.column_orders : {},
          column_order,
          order,
          a,
          b,
          column;

      resolved_items.sort((a_item, b_item) => {
        for (let id in column_orders) {
          column = this.props.columns.find(c => String(c.id) === String(id));
          a = this.wrapped_component.getValue(a_item, column);
          b = this.wrapped_component.getValue(b_item, column);

          if (a === null || typeof a == 'undefined' || a === '') {
            return 1;
          }
          else if (b === null || typeof b == 'undefined' || b === '') {
            return -1;
          }
          else if (a === b) {
            order = 0;
          }
          else {
            order = String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'});
          }

          column_order = column_orders[id];
          if (column_order === 'ASC') {
            return order;
          }
          else if (column_order === 'DESC') {
            if (order == 1) {
              return -1;
            }
            else if (order === -1) {
              return 1;
            }
            else {
              return 0;
            }
          }
        }
      });

      return resolved_items;
    }
    render() {
      return <WrappedComponent {...this.props}
                               onMount={wrapped_component => this.wrapped_component = wrapped_component}
                               ref={this.table_ref}
                               onColumnTitleClick={this.toggleColumnOrder}
                               resolveItems={this.resolve}
                               column_orders={this.state.column_orders}
                               items={this.props.items}
                               renderColumns={renderColumns}/>;
    }
  }

  Sortable.propTypes = {
    items: PropTypes.array,
    columns: PropTypes.array,
    resolveItems: PropTypes.func,
    sortItems: PropTypes.func
  };

  return Sortable;
}