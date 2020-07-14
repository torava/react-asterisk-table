/**
 * @module Tree
 */

import React, {Component, ComponentClass} from 'react';
import TreeItem from './TreeItem';
import AsteriskTable, { AsteriskTableProps } from '.';
import { Id } from './types';
import _ from 'lodash';

export default function tree(WrappedComponent: ComponentClass<any>): ComponentClass<any> {
  interface TreeProps extends AsteriskTableProps {
    flat: boolean;
    toggleAllColumnsButton: boolean;
    parentIdKey: string;
    parentKey: string;
    childrenKey: string;
  }
  
  type ExpandedItems = Record<Id, boolean>;

  interface TreeState {
    expandedItems: ExpandedItems,
    childrenStatus: boolean;
  }

  /**
   * AsteriskTable HOC component for formatting nested data to a tree view.
   * Takes flat data with parent id defined in key from parent_id_key prop when flat prop is true.
   * Additionally, parent object can be defined in parent_key to speedup recursive expanding.
   * Takes nested data with children listed in key from children_key prop when flat prop is false.
   * 
   * @class
   */
  class Tree extends Component<TreeProps, TreeState> {
    public static defaultProps = {
      toggleAllColumnsButton: true,
      parentIdKey: 'parent_id',
      parentKey: 'parent',
      childrenKey: 'children',
      flat: false
    }
    constructor(props: TreeProps) {
      super(props);

      this.state = {
        expandedItems: {},
        childrenStatus: false
      };

      this.toggleChildren = this.toggleChildren.bind(this);
      this.toggleAllChildren = this.toggleAllChildren.bind(this);
      this.closeChildren = this.closeChildren.bind(this);
      this.expandChildren = this.expandChildren.bind(this);
      this.checkChildrenStatus = this.checkChildrenStatus.bind(this);
    }
    /**
     * @returns {object} expanded item id as key and order as value
     */
    getExpandedItems() {
      return this.state.expandedItems;
    }
    /**
     * If data is flat, then filters items by parent
     * 
     * @param {array} items
     * @param {object} parent 
     * @returns {array} resolved items
     */
    resolveItems(items: any[], parent: any) {
      return this.props.flat ? items.filter(item => (!parent && !item[this.props.parentIdKey]) || (parent && item[this.props.parentIdKey] === parent.id)) : items;
    }
    /**
     * Checks if all children are expanded for toggle all children button state
     * 
     * @param {object} [expanded_items] expanded items if not to be read from state
     * @returns {bool} is all children expanded
     */
    checkChildrenStatus(expandedItems: ExpandedItems = this.state.expandedItems) {
      if (!this.props.toggleAllColumnsButton) return;

      let allExpanded = true;

      let check = (items: any[]) => {
        items.forEach(item => {
          if (!expandedItems[item.id]) {
            allExpanded = false;
            return;
          } else if (item[this.props.childrenKey] && item[this.props.childrenKey].length) {
            check(item.children);
          }
        });
      };

      check(this.props.items);

      return allExpanded;
    }
    /**
     * Closes all children if all children are expanded and otherwise expands all children
     * 
     * @param {object} event 
     */
    toggleAllChildren(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
      event && event.preventDefault();

      let status = this.checkChildrenStatus();
      let expandedItems = {...this.state.expandedItems};

      let toggle = (items: any[]) => {
        items.forEach(item => {
          if (status) {
            delete expandedItems[item.id];
          }
          else {
            expandedItems[item.id] = true;
          }

          if (item.children) {
            toggle(item.children);
          }
        });
      };
      toggle(this.props.items);

      this.setState({
        childrenStatus: !status,
        expandedItems
      });
    }
    /**
     * Closes children for item with given id
     */
    closeChildren(id: Id) {
      let expandedItems = {...this.state.expandedItems};
      
      delete expandedItems[id];
      
      this.setState({
        expandedItems,
        childrenStatus: false
      });
    }
    /**
     * Expands children and parents for item with given id
     */
    expandChildren(id: Id) {
      let expandedItems = {...this.state.expandedItems};

      const expandParents = (parent: any) => {
        expandedItems[parent.id] = true;
        if (parent[this.props.parentIdKey]) expandParents(parent.parent);
      };

      this.props.items.forEach(item => {
        if (item.id === id && item[this.props.parentKey]) {
          expandParents(item[this.props.parentKey]);
          return false;
        }
      });
      
      expandedItems[id] = true;

      const childrenStatus = this.checkChildrenStatus(expandedItems);
      
      this.setState({
        expandedItems,
        childrenStatus
      });
    }
    /**
     * Toggles state of item with given id between expanded and closed
     * 
     * @param {object} event 
     * @param {string} id 
     */
    toggleChildren(event: MouseEvent, id: Id) {
      event && event.preventDefault();
  
      let expandedItems = {...this.state.expandedItems},
          childrenStatus;

      if (expandedItems[id]) {
        delete expandedItems[id];
        childrenStatus = false;
      }
      else {
        expandedItems[id] = true;
        childrenStatus = this.checkChildrenStatus(expandedItems);
      }
      
      this.setState({
        expandedItems,
        childrenStatus
      });
    }
    getToggleAllColumnsButton() {
      const {columns, toggleAllColumnsButton} = this.props;

      // if toggle all columns button is true then show button on first column
      if (toggleAllColumnsButton) {
        return [
          {
            ...columns[0],
            label: [
              <a
                key={'toggle-all-children'}
                href="#"
                onClick={event => this.toggleAllChildren(event)}
                className={'expand no-action '+(this.state.childrenStatus ? 'expanded' : 'closed')}>
              </a>,
              columns[0].label
            ]
          },
          ...columns.slice(1)
        ];
      }
      else return columns;
    }
    render() {
      const {items} = this.props;
      const resolve = (items: any[], item: any) => this.props.resolveItems ? this.props.resolveItems(this.resolveItems(items, item)) : this.resolveItems(items, item);
      const columns = this.getToggleAllColumnsButton();

      return <WrappedComponent
        {...this.props}
        columns={columns}
        items={items}
        Item={TreeItem}
        resolveItems={resolve}
        toggleChildren={this.toggleChildren}
        expandedItems={this.state.expandedItems}/>;
    }
  }

  return Tree;
}