import React from 'react';
import {mount} from 'enzyme';
import AsteriskTable from '../';
import sortable from '../Sortable';
import expect from 'expect';

const columns = [{
  id: 'name',
  label: 'Name'
}];

const items = [{
  id: 1,
  name: 'ZZ Top'
},
{
  id: 2,
  name: '007'
},
{
  id: 3,
  name: 'Test 2'
},
{
  id: 4,
  name: 'Test 1',
},
{
  id: 5,
  name: 0
},
{
  id: 6,
  name: -9999
},
{
  id: 7
}];

const SortableTable = sortable(AsteriskTable);
const table = mount(<SortableTable columns={columns} items={items}/>);

it('should render table correctly', () => {
  expect(table.find('tr').length).toEqual(columns.length+items.length); // should have header row and item rows
  expect(table.find('th').text()).toEqual('Name'); // should have header column cell
  expect(table.find('td').at(0).text()).toEqual('ZZ Top'); // should have item column cell
  expect(table.find('td').at(1).text()).toEqual('007');
  expect(table.find('td').at(2).text()).toEqual('Test 2');
  expect(table.find('td').at(4).text()).toEqual('0');
  expect(table.find('td').at(5).text()).toEqual('-9999');
  expect(table.find('td').at(6).text()).toEqual('');
});

it('should sort table correctly', () => {
  table.find('th').simulate('click'); // sort to ascending order
  expect(table.find('td').at(0).text()).toEqual('-9999');
  expect(table.find('td').at(1).text()).toEqual('0');
  expect(table.find('td').at(2).text()).toEqual('007');
  expect(table.find('td').at(3).text()).toEqual('Test 1');
  expect(table.find('td').at(4).text()).toEqual('Test 2');
  expect(table.find('td').at(5).text()).toEqual('ZZ Top');
  expect(table.find('td').at(6).text()).toEqual('');
  table.find('th').simulate('click'); // sort to descending order
  expect(table.find('td').at(0).text()).toEqual('ZZ Top');
  expect(table.find('td').at(1).text()).toEqual('Test 2');
  expect(table.find('td').at(2).text()).toEqual('Test 1');
  expect(table.find('td').at(3).text()).toEqual('007');
  expect(table.find('td').at(4).text()).toEqual('0');
  expect(table.find('td').at(5).text()).toEqual('-9999');
  expect(table.find('td').at(6).text()).toEqual('');
  table.find('th').simulate('click'); // unsort
  expect(table.find('td').at(0).text()).toEqual('ZZ Top');
  expect(table.find('td').at(1).text()).toEqual('007');
  expect(table.find('td').at(2).text()).toEqual('Test 2');
  expect(table.find('td').at(3).text()).toEqual('Test 1');
  expect(table.find('td').at(4).text()).toEqual('0');
  expect(table.find('td').at(5).text()).toEqual('-9999');
  expect(table.find('td').at(6).text()).toEqual('');
});