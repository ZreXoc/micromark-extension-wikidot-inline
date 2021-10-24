import { inlineMap } from './inlineMap.js';
export const gfmStrikethroughHtml = inlineMap.map(({ tag }) => {
    return {
        enter: {
            strikethrough() {
                this.tag(tag[0]);
            }
        },
        exit: {
            strikethrough() {
                this.tag(tag[1]);
            }
        }
    };
});
