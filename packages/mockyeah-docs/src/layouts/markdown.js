import React from 'react';
import { graphql } from 'gatsby';
import Default from './default';

const Markdown = ({ data, ...props }) => (
  <Default>
    <div dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />
  </Default>
);

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(fields: { slug: { eq: $path } }) {
      html
    }
  }
`;

export default Markdown;
