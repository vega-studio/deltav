import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import { AtlasJSX } from "../../../src/base-surfaces/react-surface/resource/atlas-jsx.js";
import {
  BasicCamera2DControllerJSX,
  Camera2D,
  ClearFlags,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  ScaleMode,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src/index.js";

export default {
  title: "Deltav/2D/Image",
  args: {},
  argTypes: {},
};

export const Basic: StoryFn = (() => {
  const imageProvider = React.useRef<InstanceProvider<ImageInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const camera = React.useRef(new Camera2D());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const provider = imageProvider.current;
      if (!provider || !surface) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      // Load the image to be used for the collage
      const singleImage = new Image();
      singleImage.crossOrigin = "Anonymous"; // Ensure CORS is enabled for the image
      singleImage.src = `https://picsum.photos/id/${Math.floor(
        Math.random() * 100
      )}/200/300`;

      // Wait for the single image to load
      await new Promise((resolve) => {
        singleImage.onload = resolve;
      });

      const singleImageCanvas = document.createElement("canvas");
      singleImageCanvas.width = singleImage.width;
      singleImageCanvas.height = singleImage.height;
      const singleImageContext = singleImageCanvas.getContext("2d");
      singleImageContext?.drawImage(singleImage, 0, 0);
      const singleImageData = singleImageContext?.getImageData(
        0,
        0,
        singleImage.width,
        singleImage.height
      ).data;

      if (!singleImageData) {
        console.warn("Invalid image data", singleImageData);
        return;
      }

      const regionWidth = singleImage.width / 200; // Divide the image into 200 regions horizontally
      const regionHeight = singleImage.height / 300; // Divide the image into 100 regions vertically
      const imgArray = [];
      for (let i = 0; i < 25; i++) {
        imgArray.push(`https://picsum.photos/id/${i}/200/300`);
      }

      // Iterate through each region and calculate its tint
      for (let i = 0; i < 200; i++) {
        for (let k = 0; k < 300; k++) {
          let totalRed = 0,
            totalGreen = 0,
            totalBlue = 0;

          // Iterate over the pixels in the region
          for (let x = i * regionWidth; x < (i + 1) * regionWidth; x++) {
            for (let y = k * regionHeight; y < (k + 1) * regionHeight; y++) {
              const index = (y * singleImage.width + x) * 4; // Calculate the pixel index
              totalRed += singleImageData[index];
              totalGreen += singleImageData[index + 1];
              totalBlue += singleImageData[index + 2];
            }
          }

          // Calculate the average tint for the region
          const pixelCount = regionWidth * regionHeight;
          const averageRed = totalRed / pixelCount;
          const averageGreen = totalGreen / pixelCount;
          const averageBlue = totalBlue / pixelCount;

          // Add an image to the provider for the current region with the calculated tint
          provider.add(
            new ImageInstance({
              depth: 0,
              source: imgArray[Math.floor(Math.random() * imgArray.length)],
              width: 50,
              height: 50,
              origin: [i * 50, k * 50],
              tint: [
                averageRed / 255,
                averageGreen / 255,
                averageBlue / 255,
                1,
              ],
              scaling: ScaleMode.ALWAYS,
            })
          );
        }
      }
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <AtlasJSX name="atlas" width={4096} height={4096} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        type={ImageLayer}
        providerRef={imageProvider}
        config={{
          atlas: "atlas",
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
