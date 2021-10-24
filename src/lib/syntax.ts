import {wdInline} from './inline.js';
import {Extension} from 'micromark-util-types';

export const gfmStrikethrough = (): Extension[] => {
  return wdInline();
};
