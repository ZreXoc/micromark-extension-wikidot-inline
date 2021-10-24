import {codes} from 'micromark-util-symbol/codes.js';

export const inlineMap: Array<{
  name: string;
  match: number;
  tag: [start: string, end: string];
  keyWord: string;
}> = [
  {
    name: 'italic',
    match: codes.slash,
    tag: ['<em>', '</em>'], //this is wired
    keyWord: '/'
  },
  {
    name: 'bold',
    match: codes.asterisk,
    tag: ['<strong>', '</strong>'],
    keyWord: '*'
  },
  {
    name: 'underline',
    match: codes.underscore,
    tag: ['<span style="text-decoration: underline;">', '</span>'],
    keyWord: '_'
  },
  {
    name: 'strikethrough',
    match: codes.dash,
    tag: ['<span style="text-decoration: line-through;">', '</span>'],
    keyWord: '-'
  }
];
