import React, {Component} from 'react';
import TreeItem from './TreeItem';
import PropTypes from 'prop-types';

export default function tree(WrappedComponent) {
  /**
   * AsteriskTable HOC component for formatting nested data to a tree view.
   * Takes flat data with parent id defined in key from parent_id_key prop when flat prop is true.
   * Additionally, parent object can be defined in parent_key to speedup recursiv expanding.
   * Takes nested data with children listed in key from children_key prop when flat prop is false.
   * 
   * @class
   */
  class Tree extends Component {
    constructor(props) {
      super(props);

      this.state = {
        expanded_items: {}
      };

      this.toggleChildren = this.toggleChildren.bind(this);
      this.toggleAllChildren = this.toggleAllChildren.bind(this);
      this.closeChildren = this.closeChildren.bind(this);
      this.expandChildren = this.expandChildren.bind(this);
      this.checkChildrenStatus = this.checkChildrenStatus.bind(this);

      this.original_expandable_label = this.props.columns[0].label;

      this.resolve = (items, item) => this.props.resolveItems ? this.props.resolveItems(this.resolveItems(items, item)) : this.resolveItems(items, item);
    }
    /**
     * @returns {object} expanded item id as key and order as value
     */
    getExpandedItems() {
      return this.state.expanded_items;
    }
    /**
     * If data is flat, then filters items by parent
     * 
     * @param {array} items
     * @param {object} parent 
     * @returns {array} resolved items
     */
    resolveItems(items, parent) {
      return this.props.flat ? items.filter(item => (!parent && !item[this.props.parent_id_key]) || (parent && item[this.props.parent_id_key] === parent.id)) : items;
    }
    /**
     * Checks if all children are expanded for toggle all children button state
     * 
     * @param {object} [expanded_items] expanded items if not to be read from state
     * @returns {bool} is all children expanded
     */
    checkChildrenStatus(expanded_items) {
      if (!this.props.toggle_all_columns_button) return;

      let all_expanded = true;

      if (!expanded_items) {
        expanded_items = this.state.expanded_items;
      }

      let check = items => {
        items.forEach(item => {
          if (!expanded_items[item.id]) {
            all_expanded = false;
            return;
          } else if (item[this.props.children_key] && item[this.props.children_key].length) {
            check(item.children);
          }
        });
      };

      check(this.props.items);

      return all_expanded;
    }
    /**
     * Closes all children if all children are expanded and otherwise expands all children
     * 
     * @param {object} event 
     */
    toggleAllChildren(event) {
      event && event.preventDefault();

      let status = this.checkChildrenStatus();
      let expanded_items = {...this.state.expanded_items};

      let toggle = items => {
        items.forEach(item => {
          if (status) {
            delete expanded_items[item.id];
          }
          else {
            expanded_items[item.id] = true;
          }

          if (item.children) {
            toggle(item.children);
          }
        });
      };
      toggle(this.props.items);

      this.setState({
        children_status: !status,
        expanded_items
      });
    }
    /**
     * Closes children for item with given id
     * 
     * @param {string} id 
     */
    closeChildren(id) {
      let expanded_items = {...this.state.expanded_items};
      
      delete expanded_items[id];
      
      this.setState({
        expanded_items,
        children_status: false
      });
    }
    /**
     * Expands children and parents for item with given id
     * 
     * @param {string} id 
     */
    expandChildren(id) {
      let expanded_items = {...this.state.expanded_items};

      let expandParents = parent => {
        expanded_items[parent.id] = true;
        if (parent[this.props.parent_id_key]) expandParents(parent.parent);
      };

      this.props.items.forEach(item => {
        if (item.id === id && item[this.props.parent_key]) {
          expandParents(item[this.props.parent_key]);
          return false;
        }
      });
      
      expanded_items[id] = true;

      let children_status = this.checkChildrenStatus(expanded_items);
      
      this.setState({
        expanded_items,
        children_status
      });
    }
    /**
     * Toggles state of item with given id between expanded and closed
     * 
     * @param {object} event 
     * @param {string} id 
     */
    toggleChildren(event, id) {
      event && event.preventDefault();
  
      let expanded_items = {...this.state.expanded_items},
          children_status;

      if (expanded_items[id]) {
        delete expanded_items[id];
        children_status = false;
      }
      else {
        expanded_items[id] = true;
        children_status = this.checkChildrenStatus(expanded_items);
      }
      
      this.setState({
        expanded_items,
        children_status
      });
    }
    render() {
      // if toggle all columns button is true then show button on first column
      if (this.props.toggle_all_columns_button) {
        this.props.columns[0].label = [<a key={'toggle-all-children'}
                                        href="#"
                                        onClick={event => this.toggleAllChildren(event)}
                                        className={'expand no-action '+(this.state.children_status ? 'expanded' : 'closed')}>
                                      </a>, this.original_expandable_label];
      }

      return <WrappedComponent {...this.props}
                               items={this.props.items}
                               Item={TreeItem}
                               resolveItems={this.resolve}
                               toggleChildren={this.toggleChildren}
                               expanded_items={this.state.expanded_items}/>;
    }
  }

  Tree.propTypes = {
    items: PropTypes.array,
    flat: PropTypes.bool,
    resolveItems: PropTypes.function,
    columns: PropTypes.array,
    toggle_all_columns_button: PropTypes.bool,
    parent_id_key: PropTypes.string,
    parent_key: PropTypes.string,
    children_key: PropTypes.string
  };

  Tree.defaultProps = {
    toggle_all_columns_button: true,
    parent_id_key: 'parent_id',
    parent_key: 'parent',
    children_key: 'children'
  };

  return Tree;
}