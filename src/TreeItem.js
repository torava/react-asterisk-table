import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './TreeItem.css';

/**
 * AsteriskTable component that renders item's row, columns and possible children or child view.
 * If data is flat supposes children to be resolved in resolveItems.
 * If data is nested finds children from children key prop field.
 * 
 * @class
 */
class TreeItem extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Appends renderable columns to tds parameter from columns parameter
   * 
   * @param {array} columns 
   * @param {array} tds 
   */
  renderItemColumns(columns, tds) {
    let content,
        key,
        column_has_children,
        child;
    
    if (columns && columns.length) {
      return columns.map((column, i) => {
        column_has_children = column.columns && column.columns.length;
        content = this.props.getContent(this.props.item, column);

        key = 'td-row-'+this.props.item.id+'-column-'+column.id;

        if (i == 0) {
          // if item has children, show expandable arrow in first column
          if (this.props.childView && typeof this.props.childView === 'function' || this.itemHasChildren) {
            child = <a href="#"
                       onClick={event => this.props.toggleChildren(event, this.props.item.id)}
                       className={'expand '+(this.props.expanded_items[this.props.item.id] ? 'expanded' : 'closed')}>
                    </a>;
          }
          // else show blank column
          else {
            child = <span className="expand"></span>;
          }
        }
        else {
          child = false;
        }

        if (column_has_children) {
          this.renderItemColumns(column.columns, tds);
        }
        else {
          if (child) {
            tds.push(<td key={key}
              className={column.class}>
                <div style={{
                              paddingLeft: this.props.depth+'em'
                            }}>
                  {child}
                  {content}
                </div>
            </td>);
          }
          else {
            tds.push(<td className={column.class ? ' '+column.class : ''}
                         key={key}>
                         {content}
                    </td>);
          }
        }
      });
    }
  }

  render() {
    if (!this.props.flat) {
      this.itemHasChildren = this.props.children_key && this.props.item[this.props.children_key] && this.props.item[this.props.children_key].length;
    }
    else {
      this.itemHasChildren = this.props.items.find(item => item.parent_id === this.props.item.id);
    }
    
    let tds = [];

    this.renderItemColumns(this.props.columns, tds);

    let row = (
      <tr key={'tr-row-'+this.props.item.id}
          id={this.props.item.id}
          data-parent={this.props.parent}
          className={this.props.className}>
        {tds}
      </tr>
    );

    if (this.props.expanded_items[this.props.item.id] && this.itemHasChildren) {
      let children;
      let renderable_children = [];
      if (!this.props.flat && this.props.children_key) {
        children = this.props.item[this.props.children_key];
      }
      else {
        children = this.props.items;
      }
      if (this.props.resolveItems) {
        children = this.props.resolveItems(children, this.props.item);
      }

      if (children && children.length) {
        renderable_children = children.map((item, index) => {
          if (this.props.filter && !this.props.filter(item)) return true;

          return <TreeItem
                      {...this.props}
                      key={item.id}
                      index={index}
                      parent={this.props.item}
                      className={(this.props.className ? this.props.className+' ' : '')+this.props.item.id}
                      item={item}
                      depth={this.props.depth+1}
                    />;
        });
      }
      return [row].concat(renderable_children);
    }
    else if (this.props.expanded_items[this.props.item.id] && this.props.childView) {
      return [
        row, 
        (<tr key={'child-view-'+this.props.item.id}
             id={'child-view-'+this.props.item.id}
             className="child-view">
          <td colSpan={this.props.columns.length}>
            {this.props.childView(this.props.item)}
          </td>
        </tr>)
      ];
    }
    else {
      return row;
    }
  }
}

TreeItem.propTypes = {
  item: PropTypes.object,
  items: PropTypes.array,
  flat: PropTypes.bool,
  children_key: PropTypes.string,
  expanded_items: PropTypes.object,
  parent: PropTypes.object,
  columns: PropTypes.array,
  className: PropTypes.string,
  childView: PropTypes.func,
  getContent: PropTypes.func,
  toggleChildren: PropTypes.func,
  filter: PropTypes.func,
  resolveItems: PropTypes.func,
  depth: PropTypes.number
};

export default TreeItem;