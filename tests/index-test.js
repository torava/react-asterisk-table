import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import AsteriskTable from '../src';
import expect from 'expect';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('can render test data', () => {
  act(() => {
    ReactDOM.render(<AsteriskTable columns={[{
                                     id: 'first_name',
                                     label: 'First Name'
                                   }]}
                                   items={[{
                                     id: 1,
                                     first_name: 'First name'
                                    }
                                  ]}/>, container);
  });
  const trs = container.querySelectorAll('tr');
  const tds = container.querySelectorAll('td');
  expect(trs.length).toBe(2);
  expect(tds[0].textContent).toBe('First name');
});