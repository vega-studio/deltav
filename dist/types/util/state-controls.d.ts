import React from "react";
interface IHoverState {
    hovered: boolean;
}
interface IFocusState {
    focused: boolean;
}
interface IMosueDownState {
    mousedown: boolean;
}
export declare function controlHover<TState extends IHoverState>(component: React.Component<any, TState> & {
    container?: React.RefObject<HTMLDivElement>;
}, over?: (e: React.MouseEvent) => void | boolean, out?: (e: React.MouseEvent) => void | boolean): {
    onMouseOver: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
};
export declare function controlMouseDown<TState extends IMosueDownState>(component: React.Component<any, TState> & {
    container?: React.RefObject<HTMLDivElement>;
}): {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseOut: (e: React.MouseEvent) => void;
};
export declare function controlFocus<TState extends IFocusState>(component: React.Component<any, TState>): {
    onFocus: () => void;
    onBlur: () => void;
};
export {};
