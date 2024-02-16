import React from "react";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { CustomTag } from "../custom-tag.js";
import { ISceneBaseJSX } from "./as-scene.js";
import {
  SurfaceJSXType,
  groupSurfaceChildren,
} from "../group-surface-children.js";
import {
  ILayerProps,
  IViewProps,
  LayerInitializer,
  ViewInitializer,
} from "../../../surface/index.js";
import { Instance } from "../../../instance-provider/instance.js";
import { isDefined } from "../../../util/common-filters.js";
import { concatChildren, useChildResolvers } from "../use-child-resolver.js";
import { SurfaceContext } from "../surface-jsx.js";

export interface ISceneJSX extends Partial<ISceneBaseJSX> {
  /** Supports children. View and Layer. */
  children?: React.ReactNode;
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name: string;
}

/**
 * Provides a Scene to be used by a Surface
 */
export const SceneJSX = (props: ISceneJSX) => {
  const context = React.useContext(SurfaceContext);
  const childKey = { current: 0 };
  const groups = groupSurfaceChildren(props.children);

  const [layers, layersPromise, { nameConflict: layerNameConflict }] =
    useChildResolvers<LayerInitializer<Instance, ILayerProps<Instance>>>(
      context?.layerResolvers || new Map(),
      groups,
      SurfaceJSXType.LAYER,
      childKey,
      props.name
    );

  const [views, viewsPromise, { nameConflict: viewNameConflict }] =
    useChildResolvers<ViewInitializer<IViewProps>>(
      context?.viewResolvers || new Map(),
      groups,
      SurfaceJSXType.VIEW,
      childKey,
      props.name
    );

  if (layerNameConflict.size > 0) {
    console.warn(`Scene ${props.name} Layer name conflict:`, layerNameConflict);
    props.resolver?.resolve(null);
    return;
  }

  if (viewNameConflict.size > 0) {
    console.warn(`Scene ${props.name} View name conflict:`, viewNameConflict);
    props.resolver?.resolve(null);
    return;
  }

  if (!layers) {
    console.warn("A Scene had no Layers:", props.name);
    props.resolver?.resolve(null);
    return;
  }

  if (!views) {
    console.warn("A Scene had no Views:", props.name);
    props.resolver?.resolve(null);
    return;
  }

  useLifecycle({
    async didMount() {
      const [layerInitializers, viewInitializers] = await Promise.all([
        layersPromise,
        viewsPromise,
      ]);

      props.resolver?.resolve({
        key: props.name,
        layers: layerInitializers.filter(isDefined),
        views: viewInitializers.filter(isDefined),
      });
    },
  });

  return (
    <CustomTag tagName="Scene" {...props}>
      {concatChildren(views, layers)}
    </CustomTag>
  );
};

SceneJSX.defaultProps = {
  surfaceJSXType: SurfaceJSXType.SCENE,
} as ISceneJSX;
