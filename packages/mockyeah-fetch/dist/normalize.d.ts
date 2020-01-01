import { MatchNormal, Match } from './types';
declare const stripQuery: (url: string) => {
    url: string;
    query: any;
};
declare const normalize: (match: Match, incoming?: boolean | undefined) => MatchNormal;
export { stripQuery };
export { normalize };
