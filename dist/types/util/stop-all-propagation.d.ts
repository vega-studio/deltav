import React from "react";
/**
 * This is a VERY thorough event propogation halt. This prevents defaults
 * and propogation and handles native and React events.
 */
export declare function stopPropagation(e: React.MouseEvent | React.ChangeEvent | (MouseEvent & {
    nativeEvent?: any;
}) | Event): boolean;
