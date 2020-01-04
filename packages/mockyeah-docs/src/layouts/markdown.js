import React from 'react';
import { graphql } from 'gatsby';
import Default from './default';

const Markdown = ({ data, ...props }) => {
  // const title = data.markdownRemark.frontmatter.title || '';

  console.log('ADJ md data', data)

  return (
    <>
      OK OK OK
    </>
  );
};

// export const pageQuery = graphql`
//   query($path: String!) {
//     markdownRemark(fields: { slug: { eq: $path } }) {
//       html
//       frontmatter {
//         title
//       }
//     }
//     site {
//       siteMetadata {
//         title
//         description
//       }
//     }
//   }
// `;

export default Markdown;
