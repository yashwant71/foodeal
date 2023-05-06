import {Food} from './app/shared/models/Food';
import { Tag } from './app/shared/models/Tag';

export const sample_foods:any  = [
  {
    id:'1',
    name: 'Pizza Pepperoni',
    cookTime:20,
    price: 10,
    origins: ['italy'],
    stars: 4.5,
    tags: ['FastFood', 'Pizza', 'Lunch'],
  },
  {
    id:'2',
    name: 'Meatball',
    price: 20,
    cookTime: 20,
    origins: ['persia', 'middle east', 'china'],
    stars: 4.7,
    tags: ['SlowFood', 'Lunch'],
  },
  {
    id:'3',
    name: 'Hamburger',
    price: 5,
    cookTime: 40,
    origins: ['germany', 'us'],
    stars: 3.5,
    tags: ['FastFood', 'Hamburger'],
  },
  {
    id:'4',
    name: 'Fried Potatoes',
    price: 2,
    cookTime: 40,
    origins: ['belgium', 'france'],
    stars: 3.3,
    tags: ['FastFood', 'Fry'],
  },
  {
    id:'5',
    name: 'Chicken Soup',
    price: 11,
    cookTime: 40,
    origins: ['india', 'asia'],
    stars: 3.0,
    tags: ['SlowFood', 'Soup'],
  },
  {
    id:'6',
    name: 'Vegetables Pizza',
    price: 9,
    cookTime: 49,
    origins: ['italy'],
    stars: 4.0,
    tags: ['FastFood', 'Pizza', 'Lunch'],
  },
]

export const sample_tags:Tag[] = [
  { name: 'All', count: 6 },
  { name: 'FastFood', count: 4 },
  { name: 'Pizza', count: 2 },
  { name: 'Lunch', count: 3 },
  { name: 'SlowFood', count: 2 },
  { name: 'Hamburger', count: 1 },
  { name: 'Fry', count: 1 },
  { name: 'Soup', count: 1 },
]
