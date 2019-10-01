import React, {Component} from 'react';
import uniqid from 'uniqid';
import AsteriskTable from '../../src';
import tree from '../../src/TreeTable';
import sortable from '../../src/Sortable';
import {generateItemsWithChildView} from './data';
import _ from 'lodash';

const TreeTable = sortable(tree(AsteriskTable));
const Table = sortable(AsteriskTable);

export default class FlatTreeDemo extends Component {
  constructor() {
    super();

    let {items, child_view_items} = generateItemsWithChildView();

    this.state = {
      items,
      child_view_items,
      page: 0,
      items_per_page: 100
    };

    this.table_ref = React.createRef();

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.addChild = this.addChild.bind(this);
    this.editField = this.editField.bind(this);
    this.handleFieldSave = this.handleFieldSave.bind(this);
    this.handleDateSave = this.handleDateSave.bind(this);
    this.handleParentChange = this.handleParentChange.bind(this);

    this.addChildViewItem = this.addChildViewItem.bind(this);
    this.removeChildViewItem = this.removeChildViewItem.bind(this);
    this.handleChildViewFieldSave = this.handleChildViewFieldSave.bind(this);
  }
  addItem(event) {
    event && event.preventDefault();

    let items = [...this.state.items];
    items.push({
      id: uniqid()
    });
    this.setState({items});
  }
  addChild(event, id) {
    event && event.preventDefault();

    let items = [...this.state.items];

    items.push({
      id: uniqid(),
      parent_id: id
    });

    this.setState({items});
  }
  removeItem(event, id) {
    event && event.preventDefault();

    let items = [...this.state.items];

    items.forEach((item, index) => {
      if (item.id === id) {
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
        item = items.find(i => i.id === current_item.id);
    
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
  }
  addChildViewItem(event, parent) {
    event && event.preventDefault();

    let child_view_items = {...this.state.child_view_items};
    child_view_items[parent.id].push({
      id: uniqid()
    });
    this.setState({child_view_items});
  }
  removeChildViewItem(event, id, parent) {
    event && event.preventDefault();

    let child_view_items = {...this.state.child_view_items};

    child_view_items[parent.id].forEach((item, index) => {
      if (item.id === id) {
        child_view_items[parent.id].splice(index, 1);
        return false;
      }
    });

    this.setState({child_view_items});
  }
  handleChildViewFieldSave(value, field, current_item, parent) {
    let child_view_items = {...this.state.child_view_items},
        item = child_view_items[parent.id].find(i => i.id === current_item.id);
    
    _.set(item, field, value);

    this.setState({child_view_items});
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
                                      <a href="#" onClick={event => this.addChild(event, item.id)}>Add</a>&nbsp;
                                      <a href="#" onClick={event => this.removeItem(event, item.id)}>Remove</a>
                                    </div>
      }
    ];
  }
  getChildViewColumns(parent) {
    return [
      {
        id: 'name',
        label: 'Name',
        sortable: false,
        formatter: (value, item) => <div contentEditable
                                         suppressContentEditableWarning
                                         onKeyPress={event => this.handleFieldChange(event, value)}
                                         onBlur={event => this.handleChildViewFieldSave(event.target.innerText, 'name', item, parent)}
                                         data-placeholder="Name">
                                         {value}
                                    </div>
      },
      {
        id: 'done',
        label: 'Done',
        formatter: (value, item) => <input type="checkbox"
                                           checked={value}
                                           onChange={event => this.handleChildViewFieldSave(event.target.checked, 'done', item, parent)}/>
      },
      {
        id: 'actions',
        sortable: false,
        label: <a href="#" onClick={event => this.addChildViewItem(event, parent)}>Add</a>,
        formatter: (value, item) => <div>
                                      <a href="#" onClick={event => this.removeChildViewItem(event, item.id, parent)}>Remove</a>
                                    </div>
      }
    ];
  }
  render() {
    return <div>
      <h2>Child View Tree</h2>
      <TreeTable ref={this.table_ref}
                 columns={this.getColumns()}
                 items={this.state.items}
                 resolveItems={items => items.slice(this.state.page*this.state.items_per_page, this.state.page*this.state.items_per_page+this.state.items_per_page)}
                 childView={item => <Table columns={this.getChildViewColumns(item)}
                                           items={this.state.child_view_items[item.id]}/>}/>
      <select onChange={event => this.setState({page: parseInt(event.target.value)})}>
        {Array.apply(0, Array(Math.floor(this.state.items.length/this.state.items_per_page) || 1)).map((x, index) =>
          <option key={'page-'+index}
                  value={index+1}>
                    Page {index+1}
          </option>
        )}
      </select>
    </div>;
  }
}