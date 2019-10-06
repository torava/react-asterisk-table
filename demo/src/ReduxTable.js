import _ from 'lodash';
import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import uniqid from 'uniqid';
import AsteriskTable from '../../src';
import sortable from '../../src/Sortable';
import tree from '../../src/TreeTable';
import PropTypes from 'prop-types';
import { generateFlatTreeItems } from './data';

const TreeTable = sortable(tree(AsteriskTable));

const initialState = {
  items: generateFlatTreeItems()
};

const actions = {
  addItem: fields => ({
    type: 'ADD_ITEM',
    item: {
      id: uniqid(),
      ...fields
    }
  }),
  updateItem: (id, fields) => ({
    type: 'UPDATE_ITEM',
    id,
    fields
  }),
  removeItem: id => ({
    type: 'REMOVE_ITEM',
    id
  })
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {...state,
              items: [action.item, ...state.items]
      };
    case 'UPDATE_ITEM': {
      let items = state.items,
          index = items.findIndex(i => i.id === action.id),
          fields = action.fields,
          updated_item = {...items[index], ...fields};

      return {...state, items: [
        ...items.slice(0, index),
        updated_item,
        ...items.slice(index+1, items.length)
      ]};
    }
    case 'REMOVE_ITEM': {
      let items = [...state.items],
          index = items.findIndex(i => i.id === action.id);
      
      items.splice(index, 1);

      return {...state, items};
    }
    default:
      return state;
  }
};

const store = createStore(reducer);

class TableDemo extends Component {
  constructor() {
    super();

    this.state = {
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
  }
  addItem(event) {
    event && event.preventDefault();

    this.props.addItem();
  }
  addChild(event, parent_id) {
    event && event.preventDefault();

    let parent = this.props.items.find(i => i.id === parent_id);

    this.props.addItem({
      parent_id,
      parent
    });
  }
  removeItem(event, id) {
    event && event.preventDefault();

    this.props.removeItem(id);
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
    let item = {};
    
    _.set(item, field, value);

    this.props.updateItem(current_item.id, item);

    this.setState({editing_field: null});
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
    if (parent_id === current_item.id || // Prevent item from being one's own boss
        parent_id === current_item.parent_id) { // Do nothing if parent is not changed
      this.setState({editing_field: null});
      return;
    }

    this.props.items.forEach(item => {
      // Moves item's children to superior to avoid cross references
      if (item.parent_id === current_item.id) {
        this.props.updateItem(item.id, {
          parent_id: current_item.parent_id,
          parent: current_item
        });
      }
      if (item.id === current_item.id) {
        this.props.updateItem(item.id, {
          parent_id: parent_id,
          parent: this.props.items.find(i => i.id === parent_id)
        });
      }
    });
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
          return parent && parent.first_name && parent.last_name && (parent.first_name+' '+parent.last_name) || '';
        },
        formatter: (value, item) => {
          return (
            this.state.editing_field !== item.id+'-parent_id' ? <div onClick={() => this.editField(item, 'parent_id')}>{value || '\u00A0'}</div> :
            <select id={item.id+'-parent_id'}
                    value={item.parent_id}
                    onChange={event => this.handleParentChange(event.target.value, item)}
                    onBlur={event => this.handleParentChange(event.target.value, item)}>
              <option value="">No manager</option>
              {this.props.items.map(option_item => <option key={option_item.id}
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
  render() {
    return <div>
      <h2>Redux Tree</h2>
      <TreeTable ref={this.table_ref}
                 columns={this.getColumns()}
                 items={this.props.items}
                 resolveItems={items => items.slice(this.state.page*this.state.items_per_page, this.state.page*this.state.items_per_page+this.state.items_per_page)}/>
      <select onChange={event => this.setState({page: parseInt(event.target.value)})}>
        {Array.apply(0, Array(Math.floor(this.props.items.length/this.state.items_per_page) || 1)).map((x, index) =>
          <option key={'page-'+index}
                  value={index+1}>
                    Page {index+1}
          </option>
        )}
      </select>
    </div>;
  }
}

const mapStateToProps = state => {
  return {
    items: state.items
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    addItem: fields => dispatch(actions.addItem(fields)),
    updateItem: (id, fields) => dispatch(actions.updateItem(id, fields)),
    removeItem: id => dispatch(actions.removeItem(id))
  };
};

TableDemo.propTypes = {
  items: PropTypes.array,
  addItem: PropTypes.func,
  updateItem: PropTypes.func,
  removeItem: PropTypes.func
};

const ConnectedTableDemo = connect(
  mapStateToProps,
  mapDispatchToProps
)(TableDemo);

export default class ReactTableDemo extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedTableDemo/>
      </Provider>
    );
  }
}
