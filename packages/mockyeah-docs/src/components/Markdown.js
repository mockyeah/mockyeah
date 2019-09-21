import unified from 'unified';
import parse from 'remark-parse';
import remark2react from 'remark-react';

const Markdown = ({ children }) =>
  unified()
    .use(parse)
    .use(remark2react)
    .processSync(children.trim()).contents;

export default Markdown;
