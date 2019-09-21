/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql, Link } from 'gatsby';
import isAbsoluteUrl from 'is-absolute-url';
import { menus } from '../menus';
import Header from '../components/header';
import SEO from '../components/seo';
import Markdown from '../components/Markdown';
import '../components/layout.css';

const Menu = ({ items }) => (
  <ul>
    {items &&
      items.map(menu => (
        <li>
          {menu.url ? (
            isAbsoluteUrl(menu.url) ? (
              <a href={menu.url}>{menu.title}</a>
            ) : (
              <Link to={menu.url}>
                <Markdown>{menu.title}</Markdown>
              </Link>
            )
          ) : (
            <Markdown>{menu.title}</Markdown>
          )}
          {menu.items && <Menu items={menu.items} />}
        </li>
      ))}
  </ul>
);

const Default = ({ children, ...props }) => {
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
      <SEO />
      <Header
        siteTitle={data.site.siteMetadata.title}
        siteDescription={data.site.siteMetadata.description}
      />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0px 1.0875rem 1.45rem`,
          paddingTop: 0
        }}
      >
        <div style={{ display: 'flex' }}>
          <nav>
            <Menu items={menus.main} />
          </nav>
          <main>{children}</main>
        </div>
        <footer style={{ textAlign: 'right' }}>
          <hr />© {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </>
  );
};

Default.propTypes = {
  children: PropTypes.node.isRequired
};

export default Default;
