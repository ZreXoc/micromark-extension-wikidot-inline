import {splice} from 'micromark-util-chunked';
import {resolveAll, Resolver} from 'micromark-util-resolve-all';
import {Extension, State, Tokenizer} from 'micromark-util-types';
import {ok as assert} from 'uvu/assert';
import {inlineMap} from './inlineMap.js';

export const wdInline = (): Extension[] => {
  return inlineMap.map(({name, match, keyWord}) => {
    const eventName = {
      _: name,
      text: `${name}Text`,
      temp: `${name}Temporary`
    };

    /**
     * Take events and resolve
     */
    const resolve: Resolver = (events, context) => {
      let close: number | null = null;
      for (let index = events.length - 1; index > -1; index--) {
        //wikidot syntax: no nest rules
        if (events[index][1].type !== eventName.temp) continue;

        if (close === null && events[index][0] === 'enter') {
          close = index;
          continue;
        }

        if (close === null || events[index][0] !== 'exit') continue;

        const open = index;

        const event = {
          type: eventName._,
          start: Object.assign({}, events[open][1].start),
          end: Object.assign({}, events[close][1].end)
        };

        const text = {
          type: eventName.text,
          start: Object.assign({}, events[open][1].end),
          end: Object.assign({}, events[close][1].start)
        };

        const enter = [
          ['enter', event, context],
          ['enter', text, context]
        ];

        const inside = resolveAll(
          context.parser.constructs.insideSpan.null,
          events.slice(open + 1, close),
          context
        );

        const exit = [
          ['exit', text, context],
          ['exit', event, context]
        ];

        splice(events, open - 1, close - open + 3, [
          ...enter,
          ...inside,
          ...exit
        ]);

        close = null;
      }
      return events;
    };

    const tokenize: Tokenizer = (effects, ok, nok) => {
      let size = 0;

      /** @type {State} */
      const start: State = (code) => {
        assert(code === match, `expected '${keyWord}'`);
        effects.enter(eventName.temp);
        return more(code);
      };

      /**
       * wikidot syntax:
       *  '***s**'  -> '<b>*s</b>';
       *  '****s**' -> '<b></b>s**'
       */
      const more: State = (code) => {
        if (code === match && size < 2) {
          effects.consume(code);
          size++;
          return more;
        }

        if (size === 2) {
          effects.exit(eventName.temp);
          return ok(code);
        }

        return nok(code);
      };
      return start;
    };

    const tokenizer = {
      tokenize,
      resolveAll: resolve
    };

    return {
      text: {[match]: tokenizer},
      insideSpan: {null: [tokenizer]},
      attentionMarkers: {null: [match]}
    };
  });
};
