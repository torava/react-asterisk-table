import React, {Component} from 'react';
import uniqid from 'uniqid';
import AsteriskTable from '../../src';
import tree from '../../src/TreeTable';
import sortable from '../../src/Sortable';
import {generateFlatTreeItems} from './data';
import _ from 'lodash';

const TreeTable = sortable(tree(AsteriskTable));

export default class FlatTreeDemo extends Component {
  constructor() {
    super();

    this.state = {
      items: generateFlatTreeItems()
    };

    this.table_ref = React.createRef();

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.addChild = this.addChild.bind(this);
    this.editField = this.editField.bind(this);
    this.handleParentChange = this.handleParentChange.bind(this);
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

    items.push({
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

    items.forEach((i, index) => {
      if (i.id === id) {
        items.splice(index, 1);
        return false;
      }
    });

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
        item = items.find(item => item.id === current_item.id);
    
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

    items.forEach(item => {
      // Moves item's children to superior to avoid cross references
      if (item.parent_id === current_item.id) {
        item.parent_id = current_item.parent_id;
        item.parent = current_item;
      }
      if (item.id === current_item.id) {
        item.parent_id = parent_id;
        item.parent = items.find(i => i.id === parent_id);
      }
    });

    this.setState({items, editing_field: null});
    this.table_ref.current.getRef().current.expandChildren(parent_id);
  }
  getColumns() {
    return [
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
      {
        id: 'parent_id',
        label: 'Boss',
        property: item => {
          let parent = item.parent;
          return parent && parent.first_name+' '+parent.last_name;
        },
        formatter: (value, item) => {
          return (
            this.state.editing_field !== item.id+'-parent_id' ? <div onClick={() => this.editField(item, 'parent_id')}>{value || '\u00A0'}</div> :
            <select id={item.id+'-parent_id'}
                    value={item.parent_id}
                    onChange={event => this.handleParentChange(event.target.value, item)}
                    onBlur={event => this.handleParentChange(event.target.value, item)}>
              <option value="">No manager</option>
              {this.state.items.map(option_item => <option key={option_item.id}
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
  getItems() {
    return ;
  }
  render() {
    return <div>
      <h2>Flat Tree</h2>
      <TreeTable ref={this.table_ref}
                 columns={this.getColumns()}
                 items={this.state.items}
                 flat={true}
                 toggle_all_columns_button={false}/>
    </div>;
  }
}