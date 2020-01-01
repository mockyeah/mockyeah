interface MatchOptions {
    shortCircuit?: boolean;
    skipKeys?: string[];
}
interface MatchError {
    message: string;
    keyPath: string[];
}
declare const matches: (value: any, source: any, options?: MatchOptions | undefined) => {
    value: any;
    source: any;
    result: boolean;
    message: string | undefined;
    errors: MatchError[];
};
export default matches;
