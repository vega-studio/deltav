import { RenderTarget } from "../gl/render-target.js";
import { Texture } from "../gl/texture.js";
import { divide2, scale2, Vec2, Vec4 } from "../math/vector.js";
import { FragmentOutputType, IColorPickingData, PickType } from "../types.js";
import { emitOnce } from "../util/emit-once.js";
import { Surface } from "./surface.js";
import { IViewProps, View } from "./view.js";

export interface ISurfaceCommandsOptions {
  surface: Surface;
}

function analyzeColorPickingRendering(
  view: View<IViewProps>,
  mouse: Vec2,
  data: Uint8Array,
  width: number,
  height: number
) {
  const pickingData: IColorPickingData = {
    view,
    allColors: [],
    colorData: data,
    dataHeight: height,
    dataWidth: width,
    mouse,
    nearestColor: 0,
    nearestColorBytes: [0, 0, 0, 0],
  };

  const uniqueColors = new Map<number, boolean>();
  let pixelIndex = 0;
  const colors: number[][] = [];
  const mouseX: number = width / 2;
  const mouseY: number = height / 2;

  let nearestColor = 0x000000;
  let nearestColorBytes: Vec4 = [0, 0, 0, 0];
  let distance = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < height; ++i) {
    const row: number[] = [];
    colors.push(row);

    for (let k = 0; k < width; ++k) {
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      pixelIndex += 4;

      const color = (r << 16) | (g << 8) | b;
      uniqueColors.set(color, true);
      row.push(color);

      // If the color is not black, let's test the distance against currnet nearest color
      if (color !== 0x000000) {
        const dx = k - mouseX;
        const dy = i - mouseY;
        const testDistance = dx * dx + dy * dy;

        if (testDistance < distance) {
          distance = testDistance;
          nearestColor = color;
          nearestColorBytes = [r, g, b, 255];
        }
      }
    }
  }

  // Apply all of the unique colors that were discovered within the rendering
  pickingData.allColors = Array.from(uniqueColors.keys());
  // The nearest color will be the element in the middle of the array of colors
  pickingData.nearestColor = nearestColor;
  // The nearest color in byte components
  pickingData.nearestColorBytes = nearestColorBytes;

  return pickingData;
}

/**
 * These are deeply integrated commands that are available but made convenient
 * through surface features. These commands are designed to be ran either pre or
 * post render and may involve blocking CPU to GPU commands such as
 * computational feedback or pixel reading from a texture.
 */
export class SurfaceCommands {
  surface: Surface;
  pickingRenderTargets = new Map<View<any>, RenderTarget>();

  constructor(options: ISurfaceCommandsOptions) {
    this.surface = options.surface;
  }

  private analyzePickedPixels(location: Vec2, view: View<any>) {
    // Optimized rendering of the view will make the view discard picking
    // rendering
    if (view.optimizeRendering) {
      return;
    }

    const position = divide2(
      // Our location is relative to the screen, so we must scale it by the
      // surface's pixel ratio to match the actual pixel space of the original
      // screen dimensions
      scale2(location, this.surface.pixelRatio),
      // We then have to scale down the location based on the scaling of the
      // view relative to the view's scaling relative to the screen.
      view.projection.screenScale
    );

    // Make our metrics for how much of the image we wish to analyze
    const pickWidth = 5;
    const pickHeight = 5;
    const numBytesPerColor = 4;
    const out = new Uint8Array(pickWidth * pickHeight * numBytesPerColor);

    // Read the pixels out
    this.surface.renderer.readPixels(
      Math.floor(position[0] - pickWidth / 2),
      Math.floor(position[1] - pickHeight / 2),
      pickWidth,
      pickHeight,
      out
    );

    // Analyze the rendered color data for the picking routine
    const pickingData = analyzeColorPickingRendering(
      view,
      [position[0] - view.screenBounds.x, position[1] - view.screenBounds.y],
      out,
      pickWidth,
      pickHeight
    );

    // Apply the interaction picing information to the layers related to the
    // view.
    for (let j = 0, endj = view.scene.layers.length; j < endj; ++j) {
      const layer = view.scene.layers[j];

      if (layer.picking.type === PickType.SINGLE) {
        layer.interactions!.colorPicking = pickingData;
      }
    }
  }

  /**
   * This causes picking operations to get dequeued and have the textures
   * associated with the picking have their pixels read for interpretation for
   * instance interaction.
   *
   * This is a BLOCKING operation and it will block until ALL GPU operations
   * have been completed by the GPU. Thus, it is recommended to perform this
   * command at the beginning of the pipeline to allow for the operations of the
   * previous frame to complete.
   */
  decodePicking() {
    const interaction = this.surface.getCurrentInteraction();
    if (!interaction) return;

    const position = interaction.screen.position;
    const views = interaction.target.views.map((v) => v.view);

    // Clean out any render targets that have no valid texture to read from.
    const toRemove = new Set<View<any>>();

    this.pickingRenderTargets.forEach((target, view) => {
      const buffer = target.getBuffers()[0].buffer;
      if (buffer instanceof Texture) {
        if (!buffer.gl || buffer.destroyed) {
          target.dispose();
          toRemove.add(view);
        }
      }
    });

    toRemove.forEach((view) => this.pickingRenderTargets.delete(view));

    // Loop through each potential view and seek an output buffer with type
    // picking for it
    views.forEach((view) => {
      let pickingTarget = this.pickingRenderTargets.get(view);

      // Ensure our view has a render target created for reading from the
      // picking output of the view.
      if (!pickingTarget) {
        view.getRenderTargets().forEach((renderTarget) => {
          // We do not consider the render target for valid buffers unless it's
          // been compiled.
          if (!renderTarget.gl) return;

          // Find the target that outputs for picking
          renderTarget.getBuffers().forEach((buffer) => {
            if (buffer.outputType === FragmentOutputType.PICKING) {
              if (buffer.buffer instanceof Texture) {
                if (buffer.buffer.generateMipMaps) {
                  emitOnce("decode-picking-error", () => {
                    console.warn(
                      "The Texture you provided as the target for color picking has generateMipMaps enabled. This can cause accuracy issues and may make your picking experience poor."
                    );
                  });
                }
              }
              // Generate our single render buffer target so our read pixels
              // will for sure target the right buffer
              pickingTarget = new RenderTarget({
                buffers: {
                  color: buffer,
                },
              });

              // If the target was not able to specify valid dimensions, then we
              // skip for now.
              if (pickingTarget.width === 0 || pickingTarget.height === 0) {
                pickingTarget = void 0;
                return;
              }

              this.pickingRenderTargets.set(view, pickingTarget);
            }
          });
        });
      }

      if (!pickingTarget) return;

      const currentTarget = this.surface.renderer.state.currentRenderTarget;
      let doSwitch = false;

      if (!currentTarget) doSwitch = true;
      else if (Array.isArray(currentTarget)) doSwitch = true;
      else if (
        currentTarget.getBuffers()[0].buffer !==
        pickingTarget.getBuffers()[0].buffer
      ) {
        doSwitch = true;
      }

      if (doSwitch) {
        this.surface.renderer.setRenderTarget(pickingTarget);
      }

      // After we have established a proper target to set for our view for
      // picking, we go ahead and read pixels from the provided location.
      this.analyzePickedPixels(position, view);
    });
  }
}
