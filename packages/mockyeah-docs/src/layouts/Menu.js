import React from 'react';
import isAbsoluteUrl from 'is-absolute-url';
import { Link } from 'gatsby';
import Markdown from '../components/Markdown';

const Menu = ({ items }) => (
  <ul>
    {items &&
      items.map(menu => (
        <li>
          {typeof menu.url !== 'undefined' ? (
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

export default Menu;
