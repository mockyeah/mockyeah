import isPlainObject from 'lodash/isPlainObject';
import isEqual from 'lodash/isEqual';
import { MatchObject } from './types';

const isMockEqual = (match1: MatchObject, match2: MatchObject) => {
  const on1 = match1.$meta ? match1.$meta.originalNormal : undefined;
  const on2 = match2.$meta ? match2.$meta.originalNormal : undefined;

  if (!isPlainObject(on1) || !isPlainObject(on2)) {
    return on1 === on2;
  }

  if (!on1 || !on2) return false;

  return (
    on1.url === on2.url &&
    on1.path === on2.path &&
    on1.method === on2.method &&
    isEqual(on1.query, on2.query) &&
    isEqual(on1.body, on2.body) &&
    isEqual(on1.headers, on2.headers) &&
    isEqual(on1.cookies, on2.cookies)
  );
};

export { isMockEqual };
