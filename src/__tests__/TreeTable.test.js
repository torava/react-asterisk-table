import React from 'react';
import {mount} from 'enzyme';
import AsteriskTable from '../';
import tree from '../TreeTable';
import expect from 'expect';

const columns = [{
  id: 'name',
  label: 'Name'
}];

const items = [{
  id: 1,
  name: 'Branch',
  parent_id: 3
},
{
  id: 2,
  name: 'Leaf',
  parent_id: 1
},
{
  id: 3,
  name: 'Tree'
}];

const TreeTable = tree(AsteriskTable);
const table = mount(<TreeTable columns={columns} items={items} flat={true}/>);

it('should render table correctly', () => {
  expect(table.find('tr').length).toEqual(2); // should have 1 header row and 4 item rows
  expect(table.find('th').text()).toEqual('Name'); // should have header column cell
  expect(table.find('td').at(0).text()).toEqual('Tree'); // should have parent column cell
});

it('should expand items', () => {
  table.find('.expand').at(1).simulate('click');
  expect(table.find('tr').length).toEqual(3);
  expect(table.find('td').at(1).text()).toEqual('Branch');
  table.find('.expand').at(2).simulate('click');
  expect(table.find('tr').length).toEqual(4);
  expect(table.find('td').at(2).text()).toEqual('Leaf');
});

it('should close items', () => {
  table.find('.expand').at(2).simulate('click');
  expect(table.find('tr').length).toEqual(3);
  table.find('.expand').at(1).simulate('click');
  expect(table.find('tr').length).toEqual(2);
});

it('should expand table', () => {
  table.find('.expand').at(0).simulate('click');
  expect(table.find('tr').length).toEqual(4);
  expect(table.find('td').at(1).text()).toEqual('Branch');
  expect(table.find('td').at(2).text()).toEqual('Leaf');
});

it('should close table', () => {
  table.find('.expand').at(0).simulate('click');
  expect(table.find('tr').length).toEqual(2);
});