# React * Table

## Dependencies

node 12.x
react 16.x

## Installation

`npm install --save react-asterisk-table`

## Usage

```javascript
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

## License

MIT