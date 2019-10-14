import React from 'react';
import {mount} from 'enzyme';
import AsteriskTable from '../';
import expect from 'expect';

const columns = [{
  id: 'first_name',
  label: 'First Name'
}];

const items = [{
  id: 1,
  first_name: 'First name'
}];

it('should render table correctly', () => {
  const table = mount(<AsteriskTable columns={columns} items={items}/>);
  expect(table.find('tr').length).toEqual(2); // should have 1 header row and 1 item row
  expect(table.find('th').text()).toEqual('First Name'); // should have header column cell
  expect(table.find('td').text()).toEqual('First name'); // should have item column cell
});