'use strict';

import {BrowserRouter, Route, Switch} from 'react-router-dom';
import React, {Component} from 'react';
import FlatTreeDemo from './FlatTree';
import NestedTreeDemo from './NestedTree';
import ChildViewDemo from './ChildViewTable';
import {render} from 'react-dom';
import './index.css';

class Demo extends Component {
  render() {
    return <div>
      <h1>React * Table</h1>
      <a target="_blank" href="/out">Documentation</a><br/>
      <a href="/flattree">Tree with 10000 items in flat data structure</a><br/>
      <a href="/nestedtree">Tree with 10000 items in nested data structure</a><br/>
      <a href="/childview">Editable table with child view</a>
      <BrowserRouter>
        <Switch>
          <Route path="/flattree" component={FlatTreeDemo}/>
          <Route path="/nestedtree" component={NestedTreeDemo}/>
          <Route path="/childview" component={ChildViewDemo}/>
        </Switch>
      </BrowserRouter>
    </div>;
  }
}

render(<Demo/>, document.querySelector('#demo'));