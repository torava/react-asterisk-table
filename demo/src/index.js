'use strict';

import {BrowserRouter, Route, Switch, Link} from 'react-router-dom';
import React, {Component} from 'react';
import FlatTreeDemo from './FlatTree';
import NestedTreeDemo from './NestedTree';
import ChildViewDemo from './ChildViewTable';
import ReduxTableDemo from './ReduxTable';
import {render} from 'react-dom';
import './index.css';

class Demo extends Component {
  render() {
    return <BrowserRouter>
      <div>
        <h1>React * Table</h1>
        <a target="_blank" href="/out">Documentation</a><br/>
        <Link to="/flattree">Editable, sortable tree with nested columns and 10000 items in flat data structure</Link><br/>
        <Link to="/nestedtree">Editable, sortable tree with nested columns and 10000 items in nested data structure</Link><br/>
        <Link to="/childview">Editable, sortable table with child view</Link><br/>
        <Link to="/redux">Redux table</Link>
        <Switch>
          <Route path="/flattree" component={FlatTreeDemo}/>
          <Route path="/nestedtree" component={NestedTreeDemo}/>
          <Route path="/childview" component={ChildViewDemo}/>
          <Route path="/redux" component={ReduxTableDemo}/>
        </Switch>
      </div>
    </BrowserRouter>;
  }
}

render(<Demo/>, document.querySelector('#demo'));