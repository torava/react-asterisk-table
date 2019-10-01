import React, {Component} from 'react';
import uniqid from 'uniqid';
import AsteriskTable from '../../src';
import tree from '../../src/TreeTable';
import sortable from '../../src/Sortable';
import {generateNestedTreeItems} from './data';

const TreeTable = sortable(tree(AsteriskTable));

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
    this.editParent = this.editParent.bind(this);
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
  addChild(event, id) {
    event && event.preventDefault();

    let items = [...this.state.items];
    let original_item = this.findItem(items, id);
    if (!original_item.children) {
      original_item.children = [];
    }
    original_item.children.push({
      id: uniqid()
    });

    this.table_ref.current.expandChildren(id);

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
  editParent(item) {
    this.setState({parent_editing_item_id: item.id});
  }
  handleParentChange(event) {
    let parent_id = event.target.value;

    this.table_ref.current.getRef().current.expandChildren(parent_id);
  }
  getColumns() {
    return [
      {
        id: 'first_name',
        label: 'First Name',
        formatter: value => <div contentEditable suppressContentEditableWarning style={{display:'inline-block'}} data-placeholder="First Name">{value}</div>
      },
      {
        id: 'last_name',
        label: 'Last Name',
        formatter: value => <div contentEditable suppressContentEditableWarning style={{display:'inline-block'}} data-placeholder="Last Name">{value}</div>
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
            this.state.parent_editing_item_id !== item.id ? <div onClick={() => this.editParent(item)}>{value || '\u00A0'}</div> :
            <select name={item.id} value={item.parent_id} onChange={event => this.handleParentChange(event, item)}>
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
        id: 'actions',
        label: <a href="#" onClick={event => this.addItem(event)}>Add</a>,
        formatter: (value, item) => <div>
                                      <a href="#" onClick={event => this.addChild(event, item.id)}>Add</a>&nbsp;
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
                 items={this.state.items}/>
    </div>;
  }
}