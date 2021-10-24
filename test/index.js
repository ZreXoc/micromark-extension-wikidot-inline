import fs from 'fs';
import path from 'path';
import test from 'tape';
import {micromark} from 'micromark';
import {
  gfmStrikethrough as syntax,
  gfmStrikethroughHtml as html
} from '../dev/index.js';

const input = fs.readFileSync(path.join('test', 'input.wd'));
const output = fs.readFileSync(path.join('test', 'output.html'), 'utf8');

test('markdown -> html (micromark)', (t) => {
  const defaults = syntax();

  t.deepEqual(
    micromark('a -b-', {
      extensions: defaults,
      htmlExtensions: html
    }),
    '<p>a -b-</p>',
    'should not support strikethrough w/ one dashes'
  );

  t.deepEqual(
    micromark('a --b--', {
      extensions: defaults,
      htmlExtensions: html
    }),
    '<p>a <span style="text-decoration: line-through;">b</span></p>',
    'should support strikethrough w/ two dashes'
  );

  t.deepEqual(
    micromark('a ---b---', {
      extensions: defaults,
      htmlExtensions: html
    }),
    '<p>a <span style="text-decoration: line-through;">-b</span>-</p>',
    'should ignore extra dashes'
  );

  t.deepEqual(
    micromark('a --b-- --c-- d', {
      extensions: defaults,
      htmlExtensions: html
    }),
    '<p>a <span style="text-decoration: line-through;">b</span> <span style="text-decoration: line-through;">c</span> d</p>',
    'should support strikethrough w/ two dashes'
  );

  t.deepEqual(
    micromark('a --b----c-- d', {
      extensions: defaults,
      htmlExtensions: html
    }),
    '<p>a <span style="text-decoration: line-through;">b</span><span style="text-decoration: line-through;">c</span> d</p>',
    'should support constant dashes'
  );

  t.deepEqual(
    micromark(input, {extensions: defaults, htmlExtensions: html}),
    output,
    'should support inline style matching how Wikidot does it'
  );

  t.end();
});
