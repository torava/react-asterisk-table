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
     * @returns {bool} is all children expanded
     */
    checkChildrenStatus() {
      if (!this.props.toggle_all_columns_button) return;

      let all_expanded = true;
      let check = items => {
        items.forEach(item => {
          if (!this.state.expanded_items[item.id]) {
            all_expanded = false;
            return;
          } else if (item.children && item.children.length) {
            check(item.children);
          }
        });
      };

      check(this.props.items);

      this.children_status = all_expanded;

      return all_expanded;
    }
    /**
     * Closes are children if all children are expanded and otherwise expands all children
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

      this.children_status = !status;

      this.setState({
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

      this.checkChildrenStatus();
      
      this.setState({
        expanded_items
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

      this.checkChildrenStatus();
      
      this.setState({
        expanded_items
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
  
      let expanded_items = {...this.state.expanded_items};
      if (expanded_items[id]) {
        delete expanded_items[id];
      }
      else {
        expanded_items[id] = true;
      }

      this.checkChildrenStatus();
      
      this.setState({
        expanded_items
      });
    }
    render() {
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
    parent_key: PropTypes.string
  };

  Tree.defaultProps = {
    toggle_all_columns_button: true,
    parent_id_key: 'parent_id',
    parent_key: 'parent'
  };

  return Tree;
}