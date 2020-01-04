import React from 'react';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import Default from './default';

const Markdown = ({ data, ...props }) => {
  const title = data.markdownRemark.frontmatter.title || '';

  console.log('ADJ data', data);

  return (
    <>
      <Helmet title={title} titleTemplate={`%s | ${data.site.siteMetadata.title}`} />
      <Default title={title}>
        <div dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />
      </Default>
    </>
  );
};

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(fields: { slug: { eq: $path } }) {
      html
      frontmatter {
        title
      }
    }
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;

export default Markdown;
