import React from 'react';
import {mount} from 'enzyme';
import expect from 'expect';
import AsteriskTable from '.';
import renderColumns from './NestedColumnIterator';

const columns = [{
  id: 'name',
  label: 'Name',
  columns: [{
    id: 'first_name',
    label: 'First Name'
  },
  {
    id: 'last_name',
    label: 'Last Name'
  }]
}];

const items = [{
  id: 1,
  first_name: 'First name',
  last_name: 'Last name'
}];

it('should render table correctly', () => {
  const table = mount(<AsteriskTable columns={columns}
                                     items={items}
                                     renderColumns={renderColumns}/>);

  expect(table.find('tr').length).toEqual(3); // should have 2 header rows and 1 item row
  expect(table.find('tr').at(0).find('th').at(0).text()).toEqual('Name'); // should have header column cell
  expect(table.find('tr').at(1).find('th').at(0).text()).toEqual('First Name');
  expect(table.find('tr').at(1).find('th').at(1).text()).toEqual('Last Name');
  expect(table.find('td').at(0).text()).toEqual('First name'); // should have item column cell
  expect(table.find('td').at(1).text()).toEqual('Last name'); 
});