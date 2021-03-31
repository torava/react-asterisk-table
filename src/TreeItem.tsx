import React, {Component} from 'react';
import './TreeItem.css';
import { ItemProps } from './Item';
import { Id } from './types';

interface TreeItemProps extends ItemProps {
  items: any[];
  flat: boolean;
  parentIdKey: string;
  childrenKey: string;
  toggleChildren: Function;
  expandedItems: Record<Id, boolean>;
  childView: Function;
  depth: number;
  resolveItems: Function;
  parent: any;
}

/**
 * AsteriskTable component that renders item's row, columns and possible children or child view.
 * If data is flat supposes children to be resolved in resolveItems.
 * If data is nested finds children from children key prop field.
 * 
 * @class
 */
class TreeItem extends Component<TreeItemProps> {
  itemHasChildren: boolean;
  constructor(props: TreeItemProps) {
    super(props);
  }
  /**
   * Appends renderable columns to tds parameter from columns parameter
   * 
   * @param {array} columns 
   * @param {array} tds 
   */
  renderItemColumns(columns: any[], tds: React.ReactElement[]) {
    let content,
        key,
        columnHasChildren,
        child;
    
    if (columns && columns.length) {
      return columns.map((column, i) => {
        columnHasChildren = column.columns && column.columns.length;
        content = this.props.getContent(this.props.item, column);

        key = `td-row-${this.props.item.id}-column-${column.id}`;

        if (i == 0) {
          // if item has children, show expandable arrow in first column
          if (this.props.childView && typeof this.props.childView === 'function' || this.itemHasChildren) {
            child = <a href="#"
                       onClick={event => this.props.toggleChildren(event, this.props.item.id)}
                       className={'expand '+(this.props.expandedItems[this.props.item.id] ? 'expanded' : 'closed')}>
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

        if (columnHasChildren) {
          this.renderItemColumns(column.columns, tds);
        }
        else {
          if (child) {
            tds.push(<td key={key}
                         className={column.class}
                         {...this.props.tdProps}>
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
      this.itemHasChildren = this.props.childrenKey && this.props.item[this.props.childrenKey] && this.props.item[this.props.childrenKey].length;
    }
    else {
      this.itemHasChildren = this.props.items.find(item => item[this.props.parentIdKey] === this.props.item.id);
    }
    
    const tds: React.ReactElement[] = [];

    this.renderItemColumns(this.props.columns, tds);

    const row = (
      <tr key={'tr-row-'+this.props.item.id}
          id={this.props.item.id}
          data-parent={this.props.parent}
          {...this.props.trProps}>
        {tds}
      </tr>
    );

    if (this.props.expandedItems[this.props.item.id] && this.itemHasChildren) {
      let children;
      let renderableChildren = [];
      if (!this.props.flat && this.props.childrenKey) {
        children = this.props.item[this.props.childrenKey];
      }
      else {
        children = this.props.items;
      }
      if (this.props.resolveItems) {
        children = this.props.resolveItems(children, this.props.item);
      }

      if (children && children.length) {
        renderableChildren = children.map((item: any) => {
          return <TreeItem
                      {...this.props}
                      key={item.id}
                      parent={this.props.item}
                      item={item}
                      depth={this.props.depth+1}
                    />;
        });
      }
      return [row].concat(renderableChildren);
    }
    else if (this.props.expandedItems[this.props.item.id] && this.props.childView) {
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

export default TreeItem;