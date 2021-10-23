/* Import fs from 'fs'
import path from 'path' */
import test from 'tape'
import {micromark} from 'micromark'
import {
  gfmStrikethrough as syntax,
  gfmStrikethroughHtml as html
} from '../dev/index.js'

/* Const input = fs.readFileSync(path.join('test', 'input.md'))
const output = fs.readFileSync(path.join('test', 'output.html'), 'utf8') */

test('markdown -> html (micromark)', (t) => {
  const defaults = syntax()

  t.deepEqual(
    micromark('a -b-', {
      extensions: [defaults],
      htmlExtensions: [html]
    }),
    '<p>a -b-</p>',
    'should not support strikethrough w/ one dashes'
  )

  t.deepEqual(
    micromark('a --b--', {
      extensions: [defaults],
      htmlExtensions: [html]
    }),
    '<p>a <del>b</del></p>',
    'should support strikethrough w/ two dashes'
  )

  t.deepEqual(
    micromark('a ---b---', {
      extensions: [defaults],
      htmlExtensions: [html]
    }),
    '<p>a <del>-b</del>-</p>',
    'should ignore extra dashes'
  )
  t.end()
})
