/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { menus } from '../menus';
import Header from '../components/header';
import SEO from '../components/seo';
import Menu from './Menu';
import '../components/layout.css';

const Default = props => {
  const { children, title } = props;

  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `);

  return (
    <>
      <Helmet
        link={[
          {
            rel: 'stylesheet',
            href: 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
          }
        ]}
      />
      <SEO title={title} />
      <Header
        siteTitle={data.site.siteMetadata.title}
        siteDescription={data.site.siteMetadata.description}
      />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 1200,
          padding: `0px 1.0875rem 1.45rem`,
          paddingTop: 0
        }}
      >
        <div id="page">
          <main>{children}</main>
          <nav>
            <Menu items={menus.main} />
          </nav>
        </div>
        <footer style={{ textAlign: 'right' }}>
          <hr />
          <div>
            © {new Date().getFullYear()} mockyeah, Built with
            {` `}
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Default;
