import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from './Alert';
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
        maxWidth: 1200,
        padding: `1.45rem 1.0875rem .2rem`,
        display: 'flex',
        color: `white`
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            textDecoration: `none`,
            paddingRight: '1rem'
          }}
        >
          <img id="logo" src={logo} alt="Logo" width="160" style={{ marginRight: '1rem' }} />
        </Link>
      </div>
      <div style={{ display: 'flex' }}>
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
          <div id="links" style={{ marginTop: '.5rem' }}>
            <a href="https://github.com/mockyeah/mockyeah" alt="GitHub">
              <i class="fa fa-github"></i>
            </a>{' '}
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
    </div>

    <Alert>
      <div style={{ textAlign: 'center' }}>
        <strong>Notice:</strong> These docs are for mockyeah <code>1.x</code> & above. For legacy
        mockyeah <code>0.x</code>, please see{' '}
        <a href="https://mockyeah.github.io/mockyeah">mockyeah.github.io/mockyeah</a>.
      </div>
    </Alert>
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
