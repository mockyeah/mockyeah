/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from 'react';
import { Link } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';

const components = {
  a: ({ href, ...props }) => <Link to={href} {...props} />
};

export const wrapRootElement = ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
);
