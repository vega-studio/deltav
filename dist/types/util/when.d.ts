export declare function when<TTest, T, U>(condition: TTest | null | undefined, value: ((condition: TTest) => T) | T): T | U | undefined;
export declare function when<TTest, T, U>(condition: TTest | null | undefined, value: ((condition: TTest) => T) | T, otherwise: (() => U) | U): T | U;
