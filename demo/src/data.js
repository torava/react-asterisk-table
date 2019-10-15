import uniqid from 'uniqid';
import _ from 'lodash';

const first_names = ['Oliver', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar', 'Walter',
                     'Olivia', 'Amelia', 'Emily', 'Isla', 'Ava', 'Jessica', 'Isabella', 'Lily', 'Ella', 'Mia', 'Taylor',
                     'Aaron', 'Barry', 'Cecilia', 'Diana', 'Erkki', 'Fergus', 'George', 'Harry', 'Igor', 'Jane',
                     'Kalle', 'Larry', 'Mary', 'Nooa', 'Oscar', 'Pentti', 'Quentin', 'Simon', 'Tim', 'Uuno', 'Ville',
                     'William', 'Xavier', 'Yrjö', 'Zacharias', 'Äänis', 'Östen', 'Åke'];
const last_names = ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Davies', 'Robinson', 'Wright',
                    'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke',
                    'Garcia', 'Martinez', 'Rodriguez', 'Miller', 'Anttila', 'Baker', 'Calaway', 'Day-Lewis', 'Erkkilä',
                    'Ferguson', 'Gates', 'Harrison', 'Irwin', 'Jalonen', 'Kakimoto', 'LeBlanc', 'Morrison', 'Nieminen',
                    'Oliver', 'Penttinen', 'Quimpy', 'Serrano', 'Törnqvist', 'Uhlmann', 'Virtanen', 'Willis', 'Xanthos',
                    'Yrjänä', 'Zagorac', 'Åström'];

function getRandomDate(start, end) {
  return new Date(start.getTime()+Math.random()*(end.getTime()-start.getTime()));
}

export function generateFlatTreeItems() {
  let items = [];
  let addItem = (items, parent) => {
    if (parent) parent.hasChildren = true;
    items.push({
      id: uniqid(),
      parent,
      parent_id: parent && parent.id,
      first_name: _.sample(first_names),
      last_name: _.sample(last_names),
      recruited_on: getRandomDate(new Date(2000, 0, 0), new Date())
    });
    return items[items.length-1];
  };

  addItem(items);

  let first_item;
  for (let i = 0; i < 100; i++) {
    first_item = addItem(items, items[0]);
    for (let j = 0; j < 100; j++) {
      addItem(items, first_item);
    }
  }

  return items;
}

export function generateNestedTreeItems() {
  let items = [];
  let addItem = (items, parent) => {
    items.push({
      id: uniqid(),
      first_name: first_names[Math.floor(Math.random()*first_names.length)],
      last_name: last_names[Math.floor(Math.random()*last_names.length)],
      recruited_on: getRandomDate(new Date(2000, 0, 0), new Date()),
      parent_id: parent && parent.id,
      parent
    });
  };

  let first,
      second;

  addItem(items);
  first = items[0];
  first.children = [];
  for (let i = 0; i < 100; i++) {
    addItem(items[0].children, first);
    second = items[0].children[i];
    second.children = [];
    for (let j = 0; j < 100; j++) {
      addItem(second.children, second);
    }
  }

  return items;
}

export function generateItemsWithChildView() {
  let items = generateFlatTreeItems(),
      child_view_items = {},
      accumulator = 0,
      i;
  items.forEach(item => {
    child_view_items[item.id] = [];
    for (i = 1; i <= 10; i++) {
      child_view_items[item.id].push({
        id: uniqid(),
        name: 'Item '+(accumulator+i),
        done: Math.random() > 0.5 ? true : false
      });
    }
    accumulator += i;
  });

  return {items, child_view_items};
}

export default {first_names, last_names, generateFlatTreeItems, generateNestedTreeItems};