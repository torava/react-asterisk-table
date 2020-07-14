import React, {Component} from 'react';
import uniqid from 'uniqid';
import AsteriskTable from '../../src';
import tree from '../../src/Tree';
import sortable from '../../src/Sortable';
import renderColumns from '../../src/NestedColumnIterator';
import {generateNestedTreeItems} from './data';
import _ from 'lodash';

const TreeTable = sortable(tree(AsteriskTable));

function flattenItems(items) {
  let flat_items = [];
  
  items.forEach(item => {
    flat_items.push(item);
    if (item.children && item.children.length) {
      flat_items = flat_items.concat(flattenItems(item.children));
    }
  });
    
  return flat_items;
}

export default class NestedTreeDemo extends Component {
  constructor() {
    super();
    
    this.state = {
      items: generateNestedTreeItems()
    };

    this.table_ref = React.createRef();

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.addChild = this.addChild.bind(this);
    this.editField = this.editField.bind(this);
    this.handleParentChange = this.handleParentChange.bind(this);
  }
  findItem(items, id) {
    let item;
    let find = findable_items => {
      findable_items.forEach(i => {
        if (i.id === id) {
          item = i;
          return false;
        }
        else if (i.children && i.children.length) {
          find(i.children);
        }
      });
    };
    find(items);
    return item;
  }
  addItem(event) {
    event && event.preventDefault();

    let items = [...this.state.items];
    items.push({
      id: uniqid()
    });
    this.setState({items});
  }
  addChild(event, parent) {
    event && event.preventDefault();

    let items = [...this.state.items];
    let original_item = this.findItem(items, parent.id);
    if (!original_item.children) {
      original_item.children = [];
    }
    original_item.children.push({
      id: uniqid(),
      parent_id: parent.id,
      parent
    });

    this.table_ref.current.getRef().current.expandChildren(parent.id);

    this.setState({items});
  }
  removeItem(event, id) {
    event && event.preventDefault();

    let items = [...this.state.items];

    let remove = findable_items => {
      findable_items.forEach((i, index) => {
        if (i.id === id) {
          findable_items.splice(index, 1);
          return false;
        }
        else if (i.children && i.children.length) {
          remove(i.children);
        }
      });
    };
    remove(items);

    this.setState({items});
  }
  handleFieldChange(event, value) {
    // Cancel edit on pressing Esc
    if (event.key == 'Escape') {
      event.target.innerHTML = value;
      event.target.blur();
    }
    // Prevent line break
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }
  handleFieldSave(value, field, current_item) {
    let items = [...this.state.items],
        item = this.findItem(items, current_item.id);
    
    _.set(item, field, value);

    this.setState({items, editing_field: null});
  }
  handleDateSave(value, field, current_item) {
    // Validate date input before save
    if (value instanceof Date && !isNaN(value)) {
      this.handleFieldSave(value, field, current_item);
    }
    else {
      this.setState({editing_field: null});
    }
  }
  editField(item, field) {
    this.setState({editing_field: item.id+'-'+field}, () => {
      document.getElementById(item.id+'-'+field).focus();
    });
  }
  handleParentChange(parent_id, current_item) {
    let items = [...this.state.items];

    if (parent_id === current_item.id || // Prevent item from being one's own boss
        parent_id === current_item.parent_id) { // Do nothing if parent is not changed
      this.setState({editing_field: null});
      return;
    }

    let item = this.findItem(items, current_item.id);
    let parent = parent_id && this.findItem(items, parent_id);
    // If item has no parent, then remove item from root, add item's children to root and remove parent of the children
    if (!item.parent) {
      items = items.filter(i => i.id !== item.id);
      if (item.children && item.children.length) {
        items = items.concat(item.children);
        item.children = item.children.map(child => {
          delete child.parent;
          delete child.parent_id;
        });
      }
    }
    // If item has parent, then remove item from it, add item's children to it and set it as parent of the children
    else {
      if (!item.parent.children) {
        item.parent.children = [];
      }
      else {
        item.parent.children = item.parent.children.filter(i => i.id !== item.id);
      }
      if (item.children && item.children.length) {
        item.parent.children = item.parent.children.concat(item.children);
        item.children = item.children.map(child => {
          child.parent = item.parent;
          child.parent_id = item.parent_id;
        });
      }
    }

    item.children = [];

    // If parent is defined, then set it as item's parent and add item to parent's children
    if (parent) {
      item.parent = parent;
      item.parent_id = parent_id;
      if (!item.parent.children) {
        item.parent.children = [];
      }
      item.parent.children.push(item);
    }
    // Else add item to root
    else {
      items.push(item);
      delete item.parent;
      delete item.parent_id;
    }

    this.setState({items, editing_field: null});

    this.table_ref.current.getRef().current.expandChildren(parent_id);
  }
  getColumns() {
    return [
      {
        id: 'name',
        label: 'Name',
        columns: [
          {
            id: 'first_name',
            label: 'First Name',
            formatter: (value, item) => <div contentEditable
                                            suppressContentEditableWarning
                                            onKeyPress={event => this.handleFieldChange(event, value)}
                                            onBlur={event => this.handleFieldSave( event.target.innerText, 'first_name', item)}
                                            style={{display:'inline-block'}}
                                            data-placeholder="First Name">
                                            {value}
                                        </div>
          },
          {
            id: 'last_name',
            label: 'Last Name',
            formatter: (value, item) => <div contentEditable
                                            suppressContentEditableWarning
                                            onKeyPress={event => this.handleFieldChange(event, value)}
                                            onBlur={event => this.handleFieldSave( event.target.innerText, 'last_name', item)}
                                            style={{display:'inline-block'}}
                                            data-placeholder="Last Name">
                                            {value}
                                        </div>
          },
        ],
      },
      {
        id: 'parent_id',
        label: 'Manager',
        property: item => {
          let parent = item.parent;
          return parent && parent.first_name+' '+parent.last_name;
        },
        formatter: (value, item) => {
          return (
            this.state.editing_field !== item.id+'-parent_id' ?
            <span onClick={() => this.editField(item, 'parent_id')}
                  style={{display: 'block'}}>
                  {value || '\u00A0'}
            </span> :
            <select id={item.id+'-parent_id'}
                    name={item.id}
                    value={item.parent_id}
                    onChange={event => this.handleParentChange(event.target.value, item)}>
              <option value="">No manager</option>
              {flattenItems(this.state.items).map(option_item => <option key={option_item.id}
                                                                         value={option_item.id}>
                                                                         {option_item.first_name} {option_item.last_name}
                                                                 </option>)}
            </select>
          );
        }
      },
      {
        id: 'recruited_on',
        label: 'Recruited on',
        formatter: (value, item) => (this.state.editing_field !== item.id+'-recruited_on' ? <div onClick={() => this.editField(item, 'recruited_on')}>{value ? value.toLocaleString() : '\u00A0'}</div> :
                                     <input id={item.id+'-recruited_on'}
                                            type="datetime-local"
                                            onBlur={event => this.handleDateSave(new Date(event.target.value), 'recruited_on', item)}
                                            defaultValue={value && value.toISOString().substr(0, 19)}/>)
      },
      {
        id: 'actions',
        sortable: false,
        label: <a href="#" onClick={event => this.addItem(event)}>Add</a>,
        formatter: (value, item) => <div>
                                      <a href="#" onClick={event => this.addChild(event, item)}>Add</a>&nbsp;
                                      <a href="#" onClick={event => this.removeItem(event, item.id)}>Remove</a>
                                    </div>
      }
    ];
  }
  render() {
    return <div>
      <h2>Nested Tree</h2>
      <TreeTable ref={this.table_ref}
                 children_key="children"
                 columns={this.getColumns()}
                 items={this.state.items}
                 toggleAllColumnsButton={false}
                 renderColumns={renderColumns}/>
    </div>;
  }
}