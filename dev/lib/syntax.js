/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').Event} Event
 */

/**
 * @typedef Options
 * @property {string} name
 * @property {string} match
 * @property {string} code
 */

import { match, ok as assert } from 'uvu/assert';
import { splice } from 'micromark-util-chunked';
import { classifyCharacter } from 'micromark-util-classify-character';
import { resolveAll } from 'micromark-util-resolve-all';
import { codes } from 'micromark-util-symbol/codes.js';
import { constants } from 'micromark-util-symbol/constants.js';
import { types } from 'micromark-util-symbol/types.js';

const inlineMarks = [{ name: 'strikethrough', match: '-', code: codes.dash }];

function syntax() {inlineMarks.forEach(({name,match,code})=>{

})
}

/**
//  * @param {Options} [options]
 * @returns {Extension}
 */
export function gfmStrikethrough() {
  const tokenizer = {
    tokenize: tokenizeStrikethrough,
    resolveAll: resolveAllStrikethrough,
  };

  return {
    text: { [codes.dash]: tokenizer },
    insideSpan: { null: [tokenizer] },
    attentionMarkers: { null: [codes.dash] },
  };

  /**
   * Take events and resolve strikethrough.
   *
   * @type {Resolver}
   */
  function resolveAllStrikethrough(events, context) {
    let index = -1;
    // Walk through all events.
    while (++index < events.length) {
      // Find a token that can close.
      if (
        events[index][0] === 'enter' &&
        events[index][1].type === 'strikethroughSequenceTemporary' &&
        events[index][1]._close
      ) {
        let open = index;

        // Now walk back to find an opener.
        while (open--) {
          // Find a token that can open the closer.
          if (
            events[open][0] === 'exit' &&
            events[open][1].type === 'strikethroughSequenceTemporary' &&
            events[open][1]._open /* &&
            // If the sizes are the same:
            events[index][1].end.offset - events[index][1].start.offset ===
              events[open][1].end.offset - events[open][1].start.offset */
          ) {
            events[index][1].type = 'strikethroughSequence';
            events[open][1].type = 'strikethroughSequence';

            const strikethrough = {
              type: 'strikethrough',
              start: Object.assign({}, events[open][1].start),
              end: Object.assign({}, events[index][1].end),
            };

            const text = {
              type: 'strikethroughText',
              start: Object.assign({}, events[open][1].end),
              end: Object.assign({}, events[index][1].start),
            };

            // Opening.
            const nextEvents = [
              ['enter', strikethrough, context],
              ['enter', events[open][1], context],
              ['exit', events[open][1], context],
              ['enter', text, context],
            ];

            // Between.
            splice(
              nextEvents,
              nextEvents.length,
              0,
              resolveAll(
                context.parser.constructs.insideSpan.null,
                events.slice(open + 1, index),
                context
              )
            );

            // Closing.
            splice(nextEvents, nextEvents.length, 0, [
              ['exit', text, context],
              ['enter', events[index][1], context],
              ['exit', events[index][1], context],
              ['exit', strikethrough, context],
            ]);

            splice(events, open - 1, index - open + 3, nextEvents);

            index = open + nextEvents.length - 2;
            break;
          }
        }
      }
    }

    index = -1;

    while (++index < events.length) {
      if (events[index][1].type === 'strikethroughSequenceTemporary') {
        events[index][1].type = types.data;
      }
    }

    return events;
  }

  /** @type {Tokenizer} */
  function tokenizeStrikethrough(effects, ok, nok) {
    const previous = this.previous;
    const events = this.events;
    let size = 0;

    return start;

    /** @type {State} */
    function start(code) {
      assert(code === codes.dash, 'expected `-`');

      if (
        previous === codes.dash &&
        events[events.length - 1][1].type !== types.characterEscape
      ) {
        return nok(code);
      }

      effects.enter('strikethroughSequenceTemporary');
      return more(code);
    }

    /** @type {State} */
    function more(code) {
      const before = classifyCharacter(previous);

      if (code === codes.dash && size < 2) {
        effects.consume(code);
        size++;
        return more;
      }

      if (size < 2) return nok(code);

      const token = effects.exit('strikethroughSequenceTemporary');
      const after = classifyCharacter(code);
      token._open =
        !after || (after === constants.attentionSideAfter && Boolean(before));
      token._close =
        !before || (before === constants.attentionSideAfter && Boolean(after));
      return ok(code);
    }
  }
}
