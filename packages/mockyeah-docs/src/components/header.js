import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import logo from '../images/logo/mockyeah-600.png';

const Header = ({ siteTitle, siteDescription }) => (
  <header
    style={{
      background: `#44017f`,
      marginBottom: `1.45rem`
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem .2rem`,
        display: 'flex',
        color: `white`
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            textDecoration: `none`
          }}
        >
          <img src={logo} alt="Logo" width="160" style={{ marginRight: 12 }} />
        </Link>
      </div>
      <div>
        <h1 style={{ margin: 0 }}>
          <Link
            to="/"
            style={{
              textDecoration: `none`,
              color: `white`
            }}
          >
            {siteTitle}
          </Link>
        </h1>
        <h2 style={{ fontSize: '1rem', marginTop: '0.2rem', marginBottom: '0.6rem' }}>
          {siteDescription}
        </h2>
        <div style={{ marginTop: 6 }}>
          <a href="https://www.npmjs.com/package/mockyeah">
            <img alt="npm" src="https://img.shields.io/npm/v/mockyeah.svg" />
          </a>{' '}
          <a href="https://travis-ci.org/mockyeah/mockyeah">
            <img alt="Travis CI" src="https://img.shields.io/travis/mockyeah/mockyeah.svg" />
          </a>{' '}
          <a href="https://coveralls.io/github/mockyeah/mockyeah">
            <img alt="Coveralls" src="https://img.shields.io/coveralls/mockyeah/mockyeah.svg" />
          </a>
        </div>
      </div>
    </div>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
  siteDescription: PropTypes.string
};

Header.defaultProps = {
  siteTitle: ``,
  siteDescription: ``
};

export default Header;
