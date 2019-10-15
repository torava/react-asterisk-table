import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * AsteriskTable component that renders item row and its columns
 * 
 * @class
 */
class Item extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Pushes renderable columns to tds parameter from columns parameter
   * 
   * @param {array} columns 
   * @param {array} tds 
   */
  renderItemColumns(columns, tds) {
    let content,
        key,
        column_has_children;
    
    if (columns && columns.length) {
      return columns.map(column => {
        column_has_children = column.columns && column.columns.length;
        if (column_has_children) {
          this.renderItemColumns(column.columns, tds);
        }
        else {
          content = this.props.getContent(this.props.item, column);

          key = 'td-row-'+this.props.item.id+'-column-'+column.id;

          tds.push(<td className={column.class ? ' '+column.class : ''}
                        key={key}>
                        {content}
                  </td>);
        }
      });
    }
  }

  render() {
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

    return row;
  }
}

Item.propTypes = {
  item: PropTypes.object,
  parent: PropTypes.object,
  className: PropTypes.string,
  columns: PropTypes.array,
  getContent: PropTypes.func
};

export default Item;