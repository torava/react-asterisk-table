import React from 'react';
import {mount} from 'enzyme';
import AsteriskTable from '../';
import tree from '../Tree';
import expect from 'expect';

const columns = [{
  id: 'name',
  label: 'Name'
}];

const nested_items = [
  {
    id: 1,
    name: 'Tree',
    children: [
      {
        id: 2,
        name: 'Branch',
        children: [
          {
            id: 3,
            name: 'Leaf'
          }
        ]
      }
    ]
  }
];

const TreeTable = tree(AsteriskTable);

describe('nested data table', () => {
  const table = mount(<TreeTable id="nested-table" columns={columns} items={nested_items} flat={false}/>);
  
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
    table.unmount();
  });
});