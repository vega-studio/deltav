import React from "react";

import { hasChild } from "./has-child.js";

interface IHoverState {
  hovered: boolean;
}

interface IFocusState {
  focused: boolean;
}

interface IMosueDownState {
  mousedown: boolean;
}

export function controlHover<TState extends IHoverState>(
  component: React.Component<any, TState> & {
    container?: React.RefObject<HTMLDivElement>;
  },
  over?: (e: React.MouseEvent) => void | boolean,
  out?: (e: React.MouseEvent) => void | boolean
) {
  return {
    onMouseOver: (e: React.MouseEvent) => {
      component.setState({ hovered: true });
      over?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      // If the component has a declared div container, then we assess that the
      // mouse leaving event is truly related to the parent or some other event
      // bubbled up.

      if (component.container && component.container.current) {
        if (
          !hasChild(component.container.current, e.nativeEvent.target as any)
        ) {
          out?.(e);
          return;
        }
      }

      component.setState({ hovered: false });
      out?.(e);
    },
  };
}

export function controlMouseDown<TState extends IMosueDownState>(
  component: React.Component<any, TState> & {
    container?: React.RefObject<HTMLDivElement>;
  }
) {
  return {
    onMouseDown: () => component.setState({ mousedown: true }),
    onMouseUp: () => component.setState({ mousedown: false }),
    onMouseOut: (e: React.MouseEvent) => {
      // If the component has a declared div container, then we assess that the
      // mouse leaving event is truly related to the parent or some other event
      // bubbled up.
      if (component.container && component.container.current) {
        if (
          !hasChild(component.container.current, e.nativeEvent.target as any)
        ) {
          return;
        }
      }

      component.setState({ mousedown: false });
    },
  };
}

export function controlFocus<TState extends IFocusState>(
  component: React.Component<any, TState>
) {
  return {
    onFocus: () => component.setState({ focused: true }),
    onBlur: () => component.setState({ focused: false }),
  };
}
