# React * Table

react-asterisk-table is an extensible React component. See examples in the demo from the link below.

## Features

- Sortable
- Custom cell formatter
- Custom item resolver
- Tree view with flat or nested data
- Child view
- Nested columns
- Support for HOCs
- TypeScript support

## Dependencies

node 12.x

react 16.x

## Installation

`npm install --save react-asterisk-table`

## Usage

```javascript
import React, {Component} from 'react';
import AsteriskTable from 'react-asterisk-table';

class Example extends Component {
  render() {
    return (<AsteriskTable columns={[{
                id: 'first_name',
                label: 'First Name'
              }]}
              items={[{
                id: 1,
                first_name: 'First name'
              }
            ]}/>);
  }
}
```

## Demos

- Sortable
- Editable
- Paging
- Nested columns
- Tree view with flat data structure
- Tree view with nested data structure
- Child view
- Redux integration

CodeSandbox https://codesandbox.io/embed/github/torava/react-asterisk-table/tree/master/

Live demo https://vuqh4.sse.codesandbox.io/

## Documentation

https://vuqh4.sse.codesandbox.io/out/

## License

MIT