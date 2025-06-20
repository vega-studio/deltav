import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import {
  add2,
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  subtract2,
  Surface,
  SurfaceJSX,
  type Vec2,
  vec2,
  View2D,
  ViewJSX,
} from "../../../src";
export default {
  title: "Deltav/2D/Edge",
  args: {},
  argTypes: {},
};

const paths: string[] = [
  '<path d="M948.1 702c-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17s-20.7-9.8-25.7-17c-5.1-7.3-7.7-10.2-12.7-10.2-5 0-7.5 3-12.7 10.2-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-4.4 0-8-3.6-8-8s3.6-8 8-8c13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17 13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 4.4 0 8 3.6 8 8s-3.6 8-8 8zM948.1 652c-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2s-7.5 3-12.7 10.2c-5.1 7.2-12 17-25.7 17s-20.7-9.8-25.7-17c-5.1-7.3-7.7-10.2-12.7-10.2-5 0-7.5 3-12.7 10.2-5.1 7.2-12 17-25.7 17-13.8 0-20.7-9.8-25.7-17-5.1-7.3-7.7-10.2-12.7-10.2-4.4 0-8-3.6-8-8s3.6-8 8-8c13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17 13.8 0 20.7 9.8 25.7 17 5.1 7.3 7.7 10.2 12.7 10.2 5 0 7.5-3 12.7-10.2 5.1-7.2 12-17 25.7-17s20.7 9.8 25.7 17c5.1 7.3 7.7 10.2 12.7 10.2 4.4 0 8 3.6 8 8s-3.6 8-8 8z"/>',
  '<path d="M339.1 102.3m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z"/>',
  '<path d="M922.4 958.3h-824c-4.4 0-8-3.6-8-8s3.6-8 8-8h824c4.4 0 8 3.6 8 8s-3.6 8-8 8z"/>',
  '<path d="M486.6 270.2l22.8 2.1-37.3 678h-74.9z"/>',
  '<path d="M496.5 297.9l6.5-57.4s-169.2-39.8-254.6-4.9c-66.6 27.2-91.1 89.4-91.4 145.8 0 8.1 60.3-161.6 339.5-83.5z"/>',
  '<path d="M498.7 275l4.9-39.6s-88.2-111.7-187.5-102.6c-84.2 7.8-117.6 55.9-137.6 91.1-10.3 18.2 150.8-107.3 320.2 51.1z"/>',
  '<path d="M498.8 297.8l-2.5-57.7s156.7-33.6 246.4 18.6c74 43.1 92.5 90 88.9 146.2-0.5 8.1-52.8-153.4-332.8-107.1z"/>',
  '<path d="M498.3 274.8l-2.1-39.8s98-95.9 197.1-85.7c82.4 8.5 110.5 60.6 128 97.1 9 18.8-142.9-117.7-323 28.4z"/>',
  '<path d="M689 878.3m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z"/>',
  '<path d="M765 950.3h-96v-16c0-26.4 21.6-48 48-48s48 21.6 48 48v16z"/>',
  '<path d="M699 949.9H571v-32c0-35.2 28.8-64 64-64s64 28.8 64 64v32z"/>',
  '<path d="M744.5 885.6c0.3-2.4 0.5-4.8 0.5-7.3 0-30.9-25.1-56-56-56-19 0-35.8 9.5-45.9 24-2.6-0.3-5.3-0.5-8.1-0.5-39.7 0-72 32.3-72 72v32c0 4.4 3.6 8 8 8h95.4c0.8 0.3 1.7 0.4 2.6 0.4h96c4.4 0 8-3.6 8-8v-16c0-20.8-11.5-39-28.5-48.6zM689 838.3c22.1 0 40 17.9 40 40v1.3c-3.9-0.8-7.9-1.3-12-1.3-6.9 0-13.6 1.3-19.7 3.6-8.3-14.3-21.4-25.5-37-31.4 7.3-7.5 17.5-12.2 28.7-12.2z m-28 103.6h-82v-24c0-30.9 25.1-56 56-56h0.5c5.6 0 11 0.9 16.1 2.5 13.5 4.2 24.8 13.3 31.8 25.2 2.8 4.8 4.9 10.1 6.2 15.6 0.9 4.1 1.5 8.3 1.5 12.6v24H661z m96 0.4h-50v-24.4c0-1.3 0-2.6-0.1-3.8-0.3-6.1-1.4-11.9-3.1-17.5 4.1-1.5 8.6-2.3 13.2-2.3 2.8 0 5.6 0.3 8.3 0.9 5.4 1.1 10.3 3.3 14.7 6.4 10.3 7.2 17.1 19.2 17.1 32.7v8z"/>',
  '<path d="M316.8 140.8c-27.1 2.5-50.2 9.3-70 20.8 7.9 0.1 16.6-0.7 26.2-2.8 20.7-4.5 35 19.5 66.1 22 37 2.9 44.4-13.5 79.4 4.5 12 6.1 21.4 7.4 28.9 5.9-1.8-1.5-3.6-2.9-5.5-4.4-30.2-23.4-76.5-50.5-125.1-46zM562 195c-11.6 7.1-21.9 14.4-30.7 21 16.1 0.2 35.5-4.1 51.7-17.8 44-37.1 78-13.3 92-25.3 4.1-3.5 8.4-9.4 12.5-15.9-47.2-3.2-94.1 18.7-125.5 38z"/>',
  '<path d="M822.2 325.1c-14.7-26.5-39.8-49.8-76.5-71.2-32.4-18.9-75.9-29-129.7-30.3 24.8-6.2 50.1-8.4 75.6-6.5 53.1 4 93.4 24.9 112.7 34.8 3.8 1.9 6.8 3.5 9.1 4.5 2.4 1.1 8.2 3.6 12.6-0.7 1.1-1 4.3-4.8 1.4-10.8-9.4-19.5-21-42-41.3-61.4-24.2-23.1-54.6-36.3-93-40.2-42.3-4.4-91 9.5-140.8 40.1-23.4 14.4-41.8 29.2-52.5 38.4-9.7-10.8-26.7-28.3-48.9-45.5-28.8-22.4-57.7-37.4-85.7-44.8 7.9-7.3 12.8-17.7 12.8-29.3 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 9.6 3.4 18.4 9.1 25.4-27.7 3.4-52.1 11.6-73 24.3-3.4-2-7.5-3.3-12.6-3.3-13.8 0-20.7 9.8-25.7 17-5.1 7.3-7.7 10.2-12.7 10.2-5 0-7.5-3-12.7-10.2-5.1-7.2-12-17-25.7-17s-20.7 9.8-25.7 17c-5.1 7.3-7.7 10.2-12.7 10.2s-7.5-3-12.7-10.2c-5.1-7.2-12-17-25.7-17-4.4 0-8 3.6-8 8s3.6 8 8 8c5 0 7.5 3 12.7 10.2 5.1 7.2 12 17 25.7 17s20.7-9.8 25.7-17c5.1-7.3 7.7-10.2 12.7-10.2s7.5 3 12.7 10.2c5.1 7.2 12 17 25.7 17 3 0 5.6-0.5 7.9-1.3-8.3 10.7-15 21.4-20.6 31.4-0.6 1-1 2-1.2 2.9-3.3-0.4-5.5-3.4-9.5-9.8-4.6-7.3-10.9-17.4-23.8-17.4s-19.2 10.1-23.8 17.4c-4.3 6.9-6.5 9.9-10.2 9.9s-5.9-3-10.2-9.9c-4.6-7.3-10.9-17.4-23.8-17.4-4.4 0-8 3.6-8 8s3.6 8 8 8c3.7 0 5.9 3 10.2 9.9 4.6 7.3 10.9 17.4 23.8 17.4s19.2-10.1 23.8-17.4c4.3-6.9 6.5-9.9 10.2-9.9s5.9 3 10.2 9.9c4.6 7.3 10.9 17.4 23.8 17.4 7.5 0 12.7-3.3 16.7-7.6 1.8-0.7 3.9-1.6 6.3-2.7 20-8.6 61.7-26.5 114.9-26.8h1.4c26.8 0 53 4.5 78.5 13.5-62-4.9-110.2-0.5-143.4 13-32.7 13.3-57.7 35.4-74.5 65.5-14.1 25.3-21.7 55.6-21.9 87.6 0 3.8 2.4 7.1 6 8 0.8 0.2 1.6 0.3 2.4 0.3 4.6 0 7-4.1 8.8-7.3 18.1-31 43.9-55.2 76.7-71.7 28.3-14.3 61.2-22.7 98.1-24.9 40-2.4 84.9 2.5 133.7 14.5l-85.3 645.9c-0.3 2.3 0.4 4.6 1.9 6.3 1.5 1.7 3.7 2.7 6 2.7h74.9c4.2 0 7.8-3.3 8-7.6l35.7-644.4c95.7-13.6 173.8-3.7 232.5 29.5 48 27.2 67.5 61.6 73.9 72.9 2 3.5 4.4 7.7 9 7.7 0.6 0 1.3-0.1 2-0.2 3.5-0.8 6.1-3.9 6.3-7.6 2.2-32.4-3-58.6-16.3-82.4zM338.1 78.3c13.2 0 24 10.8 24 24s-10.8 24-24 24-24-10.8-24-24 10.7-24 24-24z m-28.7 109.5h-1.5c-49.7 0.3-89.5 14.9-112.7 24.5 8.2-12.3 18.5-24.9 32.1-36 23.6-19.2 52.6-30.2 88.6-33.5 48.6-4.5 94.8 22.5 125 46 20.2 15.7 36.2 31.9 45.7 42.3 0.6 0.6 1.7 1.9 1.7 1.9v25c-0.1-0.1-0.2-0.1-0.3-0.2-5.5-4.6-11-9-16.6-13.2-10.8-8.1-21.8-15.3-32.9-21.6-41-23.4-84.1-35.2-129.1-35.2z m-74.8 110.7c-27.2 13.8-50 32.4-68.1 55.5 3.1-18.3 8.9-35.3 17.3-50.4 15-26.8 37.4-46.5 66.6-58.5 24.9-10.2 57.5-13.7 91-13.7 31.9 0 64.5 3.2 91.8 7 15.2 8.9 30.1 19.5 44.7 31.8 3.7 3.1 7.4 6.4 11 9.7l-0.3 9.9c-4.4-1.2-8.7-2.2-13-3.3-97.2-23.8-178.2-19.8-241 12z m228.9 642.8h-58.2l83.9-634.8c1.4 0.4 2.8 0.7 4.2 1.1 1.2 0.3 2.4 0.4 3.6 0.1h1.6l-35.1 633.6zM510 234.4s2.8-2.4 4.4-3.7c10.6-8.9 26.9-21.5 46.7-33.7 32.5-20 81.6-42.7 130.4-37.7 63.8 6.6 93 39.6 112.3 74.4-22.4-11.2-61.1-28.7-110.9-32.5-43.9-3.4-86.8 4.6-128.4 23.8-12.3 5.7-24.5 12.3-36.5 19.9-6.6 4.2-13.1 8.6-19.6 13.3-0.1 0.1-0.2 0.1-0.3 0.2l1.9-24z m245.1 86.5c-44.1-25-98.3-37.5-161.7-37.5-24.5 0-50.5 1.9-77.8 5.6l-10.2 1.5 0.4-10.3c3.4-2.7 6.9-5.4 10.3-7.9 17.2-12.6 34.6-23.1 52.3-31.5 51.9-3.5 121.1-1.2 169.3 26.9 34.2 19.9 57.3 41.2 70.6 65.2 7.9 14.2 12.5 29.5 14.1 46.9-12.3-16.8-33.1-39.6-67.3-58.9z"/>',
  '<path d="M532.1 437.5l15.9 1.3-26.2 511h-52.5z"/>',
  '<path d="M538.9 458.8l4.6-40.2s-118.5-27.8-178.4-3.4c-46.6 19-63.8 62.6-64.1 102 0 5.7 42.3-113.1 237.9-58.4z"/>',
  '<path d="M540.4 442.7l3.4-27.7s-61.8-78.2-131.4-71.8c-59 5.4-82.4 39.2-96.4 63.8-7.2 12.7 105.7-75.2 224.4 35.7z"/>',
  '<path d="M540.5 458.7l-1.7-40.4s109.8-23.6 172.7 13c51.9 30.2 64.8 63 62.3 102.4-0.4 5.6-37.1-107.5-233.3-75z"/>',
  '<path d="M540.1 442.6l-1.5-27.9s68.6-67.1 138.1-60c57.7 6 77.4 42.4 89.7 68 6.4 13.1-100.1-82.4-226.3 19.9z"/>',
  '<path d="M770 475.2c-10.5-19-28.4-35.6-54.5-50.8-21.1-12.3-47-18.2-72.3-20.5 52.7-6.8 93.5 14.2 111.1 23.3 2.7 1.4 4.8 2.5 6.5 3.2 1.8 0.8 7.2 3.2 11.5-1 2.1-2.1 3.6-5.9 1.5-10.4-6.6-13.9-15-29.8-29.5-43.6-17.1-16.3-39.5-26-66.6-28.8-30.2-3.1-64.8 6.7-100.1 28.4-15.3 9.4-27.6 19-35.3 25.6-7.1-7.7-18.5-19.2-33-30.4-33.2-25.8-66.9-38-97.4-35.2-67.6 6.2-92.2 49.4-102.7 67.8-2.5 4.3-1.2 8.2 0.7 10.4 4 4.4 9.5 2.4 11.4 1.8 1.7-0.6 3.9-1.6 6.7-2.8 18.4-7.9 61.2-26.3 113.9-15.2-28.6-0.8-57.7 1.5-79.7 10.5-23.4 9.6-41.4 25.3-53.4 46.9-10.1 18.1-15.5 39.7-15.7 62.5 0 3.8 2.4 7 5.9 8 0.8 0.2 1.6 0.3 2.4 0.3 4.5 0 6.8-4 8.2-6.3 12.5-21.3 30.2-37.9 52.8-49.3 40.8-20.7 94.2-23.2 158.7-7.6l-59.6 486.5c-0.3 2.3 0.4 4.6 1.9 6.3s3.7 2.7 6 2.7h52.5c4.3 0 7.8-3.3 8-7.6l24.9-485.6c65.6-9 119.2-2.1 159.5 20.6 33.1 18.7 46.5 42.3 50.9 50.1 1.4 2.5 3.7 6.6 8.4 6.6 0.6 0 1.3-0.1 2-0.2 3.5-0.8 6-3.8 6.3-7.5 1.3-22.8-2.5-41.6-11.9-58.7z m-94-112.5c39.4 4.1 59.5 22.9 72.8 44.1-16.3-7.7-41-17.2-71.4-19.5-30.9-2.4-61.2 3.2-90.6 16.6-12 5.5-23.8 12.3-35.5 20.3-0.2 0.1-0.3 0.2-0.5 0.3l-0.1 0.1s0.7-7.7 1-10.9c2.4-2 5.3-4.5 8.7-7.1C584.1 388 630.3 358 676 362.7z m-267.5 15.2h-1.1c-30.3 0.2-55.4 7.8-72.3 14.3 4.8-6.3 10.4-12.5 17.3-18.1 16.2-13.2 36-20.7 60.8-22.9 47.3-4.4 91.9 34.4 112.5 55.6 2 2.1 3.8 3.9 5.3 5.6 0.1 3.9 0.1 11.7 0.1 11.7-10.3-8.3-20.8-15.5-31.5-21.6-28.9-16.4-59.4-24.6-91.1-24.6zM355 455.6c-16.4 8.3-30.5 19-42.3 32.1 5.8-23.2 20.3-50.8 55.4-65.1 17.2-7 39.7-9.5 62.8-9.5 22 0 44.6 2.2 63.5 4.8 9.7 5.7 19.5 12.6 29.4 20.8 2.7 2.2 5.4 4.6 8.1 7l0.1 2.6v0.2c-3.1-0.8-6.1-1.5-9.1-2.2-67.5-16-123.9-12.9-167.9 9.3z m159.2 486.2h-35.8l58.2-475.4h0.2c0.6 0.2 1.2 0.2 1.7 0.3l-24.3 475.1zM722 471.3c-31.3-17.7-69.6-26.5-114.5-26.5-16.5 0-33.8 1.2-52 3.6-2.4 0.3-4.9 0.7-7.4 1l0.3-3.1c2.5-2 5-3.9 7.5-5.7 11.8-8.6 23.4-15.5 34.7-20.9 35.9-2.4 83.7-0.7 116.8 18.5C731 452 746.9 466.6 756 483c4 7.2 6.8 14.8 8.4 23.1-9.1-10.8-22.6-23.6-42.4-34.8z"/>',
];

function groupBy<T>(list: T[], count: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < list.length; i += count) {
    groups.push(list.slice(i, i + count));
  }
  return groups;
}

function parseInstructions(d: string[]) {
  return d
    .map((str) => (str ? str.match(/([a-zA-Z])([^a-zA-Z]*)/g) || [] : []))
    .flat()
    .map((c) => {
      const command = c[0];
      const values = c
        .substring(1)
        .split(/ (?=-)|(?=\b-\d)/g)
        .reduce((p, n) => p.concat(n.split(" ")), [] as string[]);
      return {
        command,
        values,
      };
    })
    .reduce(
      (p, n) => {
        switch (n.command) {
          case "L":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "l":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "H":
            return p.concat(
              groupBy(n.values, 1).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "h":
            return p.concat(
              groupBy(n.values, 1).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "V":
            return p.concat(
              groupBy(n.values, 1).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "v":
            return p.concat(
              groupBy(n.values, 1).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "C":
            return p.concat(
              groupBy(n.values, 6).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "c":
            return p.concat(
              groupBy(n.values, 6).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "S":
            return p.concat(
              groupBy(n.values, 4).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "s":
            return p.concat(
              groupBy(n.values, 4).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "Q":
            return p.concat(
              groupBy(n.values, 4).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "q":
            return p.concat(
              groupBy(n.values, 4).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "T":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "t":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "A":
            return p.concat(
              groupBy(n.values, 7).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "a":
            return p.concat(
              groupBy(n.values, 7).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "Z":
          case "z":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "M":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          case "m":
            return p.concat(
              groupBy(n.values, 2).map((values) => ({
                command: n.command,
                values,
              }))
            );
          default:
            return p;
        }
      },
      [] as { command: string; values: string[] }[]
    )
    .map((command) => ({
      command: command.command,
      values: command.values
        .map((v) => {
          const parsedValue = v !== "" ? parseFloat(v) : NaN;
          if (isNaN(parsedValue)) {
            console.error(
              `Failed to parse value "${v}" in command "${command.command}"`
            );
          }
          return parsedValue;
        })
        .filter((v) => !isNaN(v)), // Filter out NaN values
    }));
}

export const Basic: StoryFn = (() => {
  const lineProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezierProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezier2Provider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const lineThinProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezierThinProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezier2ThinProvider =
    React.useRef<InstanceProvider<EdgeInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const lines = lineProvider.current;
      const beziers = bezierProvider.current;
      const bezier2s = bezier2Provider.current;
      const lineThins = lineThinProvider.current;
      const bezierThins = bezierThinProvider.current;
      const bezier2Thins = bezier2ThinProvider.current;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      lines?.add(
        new EdgeInstance({
          control: [
            [size.width / 2, size.height / 2],
            [size.width / 2, size.height / 2],
          ],
          depth: 0,
          end: [size.width / 2 - 200, size.height / 2 + 50],
          start: [size.width / 2 - 200, size.height / 2 - 50],
          thickness: [10, 5],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
      beziers?.add(
        new EdgeInstance({
          control: [[size.width / 2 - 100, size.height / 2]],
          depth: 0,
          end: [size.width / 2 - 170, size.height / 2 + 50],
          start: [size.width / 2 - 170, size.height / 2 - 50],
          thickness: [10, 5],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
      bezier2s?.add(
        new EdgeInstance({
          control: [
            [size.width / 2 - 150, size.height / 2],
            [size.width / 2 - 50, size.height / 2],
          ],
          depth: 0,
          end: [size.width / 2 - 100, size.height / 2 + 50],
          start: [size.width / 2 - 100, size.height / 2 - 50],
          thickness: [10, 5],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
      lineThins?.add(
        new EdgeInstance({
          depth: 0,
          end: [size.width / 2 - 50, size.height / 2 + 50],
          start: [size.width / 2 - 50, size.height / 2 - 50],
          thickness: [1, 1],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
      bezierThins?.add(
        new EdgeInstance({
          depth: 0,
          control: [[size.width / 2 + 50, size.height / 2]],
          end: [size.width / 2 - 0, size.height / 2 + 50],
          start: [size.width / 2 - 0, size.height / 2 - 50],
          thickness: [1, 1],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
      bezier2Thins?.add(
        new EdgeInstance({
          depth: 0,
          control: [
            [size.width / 2 + 0, size.height / 2],
            [size.width / 2 + 100, size.height / 2],
          ],
          end: [size.width / 2 + 50, size.height / 2 + 50],
          start: [size.width / 2 + 50, size.height / 2 - 50],
          thickness: [1, 1],
          startColor: [1, 0, 1, 1],
          endColor: [1, 1, 0.5, 1],
        })
      );
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
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: new Camera2D(),
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        name="line"
        type={EdgeLayer}
        providerRef={lineProvider}
        config={{
          type: EdgeType.LINE,
        }}
      />
      <LayerJSX
        name="bezier"
        type={EdgeLayer}
        providerRef={bezierProvider}
        config={{
          type: EdgeType.BEZIER,
        }}
      />
      <LayerJSX
        name="bezier2"
        type={EdgeLayer}
        providerRef={bezier2Provider}
        config={{
          type: EdgeType.BEZIER2,
        }}
      />
      <LayerJSX
        name="lineThin"
        type={EdgeLayer}
        providerRef={lineThinProvider}
        config={{
          type: EdgeType.LINE_THIN,
        }}
      />
      <LayerJSX
        name="bezierThin"
        type={EdgeLayer}
        providerRef={bezierThinProvider}
        config={{
          type: EdgeType.BEZIER_THIN,
        }}
      />
      <LayerJSX
        name="bezier2Thin"
        type={EdgeLayer}
        providerRef={bezier2ThinProvider}
        config={{
          type: EdgeType.BEZIER2_THIN,
        }}
      />
    </SurfaceJSX>
  );
}).bind({});

export const Tree: StoryFn = (() => {
  const lineProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezierProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezier2Provider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const camera = React.useRef(new Camera2D());

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;
      const lines = lineProvider.current;
      const beziers = bezierProvider.current;
      const bezier2s = bezier2Provider.current;
      const size = surface.getViewSize("main");

      if (!size || !lines || !beziers || !bezier2s) {
        return;
      }

      let cursor: Vec2 = [0, 0]; // Initialize cursor at the origin
      let controlCursor: Vec2 = [0, 0];
      let start: Vec2 = [0, 0];
      let end: Vec2 = [0, 0];
      for (let j = 0; j < paths.length; j++) {
        const d = paths[j];
        const instructions = parseInstructions([d]);

        for (let i = 0; i < instructions.length; i++) {
          switch (instructions[i].command) {
            case "M": {
              start = [instructions[i].values[0], instructions[i].values[1]];
              cursor = start;
              break;
            }
            case "m": {
              start = [
                cursor[0] + instructions[i].values[0],
                cursor[1] + instructions[i].values[1],
              ];
              cursor = start;
              break;
            }
            case "L": {
              end = [instructions[i].values[0], instructions[i].values[1]];
              lines.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                })
              );
              cursor = end;
              break;
            }
            case "l": {
              end = [
                cursor[0] + instructions[i].values[0],
                cursor[1] + instructions[i].values[1],
              ];
              lines.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                })
              );
              cursor = end;
              break;
            }
            case "C": {
              // absolute cubic curveto: C x1 y1 x2 y2 x y
              const control1: Vec2 = [
                instructions[i].values[0],
                instructions[i].values[1],
              ];
              const control2: Vec2 = [
                instructions[i].values[2],
                instructions[i].values[3],
              ];
              end = [instructions[i].values[4], instructions[i].values[5]];

              beziers.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1, control2],
                })
              );

              cursor = end; // Update cursor to the end of the curve
              controlCursor = control2;
              break;
            }
            case "c": {
              const control1: Vec2 = add2(cursor, [
                instructions[i].values[0],
                instructions[i].values[1],
              ]);
              const end: Vec2 = add2(cursor, [
                instructions[i].values[4],
                instructions[i].values[5],
              ]);
              const control2: Vec2 = add2(cursor, [
                instructions[i].values[2],
                instructions[i].values[3],
              ]);

              bezier2s.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1, control2],
                })
              );
              cursor = end;
              controlCursor = control2;
              break;
            }
            case "A": {
              // absolute elliptical arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
              cursor = vec2(
                instructions[i].values[5],
                instructions[i].values[6]
              );
              break;
            }
            case "a": {
              cursor = add2(cursor, [
                instructions[i].values[5],
                instructions[i].values[6],
              ]);
              // absolute elliptical arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
              break;
            }
            case "s": {
              const control1: Vec2 = add2(
                cursor,
                subtract2(cursor, controlCursor)
              );
              const control2: Vec2 = add2(cursor, [
                instructions[i].values[0],
                instructions[i].values[1],
              ]);
              end = [
                cursor[0] + instructions[i].values[2],
                cursor[1] + instructions[i].values[3],
              ];

              bezier2s.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1, control2],
                })
              );

              cursor = end;
              controlCursor = control2;
              break;
            }
            case "Q": {
              const control1: Vec2 = [
                instructions[i].values[0],
                instructions[i].values[1],
              ];
              const end: Vec2 = [
                instructions[i].values[2],
                instructions[i].values[3],
              ];

              beziers.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1],
                })
              );
              controlCursor = control1;
              cursor = end;
              break;
            }
            case "q": {
              const control1: Vec2 = add2(cursor, [
                instructions[i].values[0],
                instructions[i].values[1],
              ]);
              const end: Vec2 = add2(cursor, [
                instructions[i].values[2],
                instructions[i].values[3],
              ]);

              beziers.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1],
                })
              );
              controlCursor = control1;
              cursor = end;
              break;
            }
            case "T": {
              const end: Vec2 = [
                instructions[i].values[0],
                instructions[i].values[1],
              ];
              const control1: Vec2 = add2(
                cursor,
                subtract2(cursor, controlCursor)
              );

              beziers.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1],
                })
              );
              cursor = end;
              controlCursor = control1;
              break;
            }
            case "t": {
              const end: Vec2 = add2(cursor, [
                instructions[i].values[0],
                instructions[i].values[1],
              ]);
              const control1: Vec2 = add2(
                cursor,
                subtract2(cursor, controlCursor)
              );

              beziers.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [control1],
                })
              );
              cursor = end;
              controlCursor = control1;
              break;
            }
            case "H": {
              // horizontal lineto: H x
              end = [instructions[i].values[0], cursor[1]];

              lines.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [],
                })
              );

              cursor = end; // Update cursor to the end of the line
              break;
            }
            case "h": {
              // relative horizontal lineto: h dx
              end = [cursor[0] + instructions[i].values[0], cursor[1]];

              lines.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: end,
                  control: [],
                })
              );

              cursor = end; // Update cursor to the end of the line
              break;
            }
            case "z": {
              // Optionally, connect the current position to the starting position
              lines.add(
                new EdgeInstance({
                  depth: 0,
                  startColor: [1, 0, 0, 1],
                  endColor: [1, 0, 0, 1],
                  thickness: [1, 1],
                  start: cursor,
                  end: start, // Connect to the starting position
                  control: [],
                })
              );

              // Reset the cursor to the starting position
              cursor = start;
              break;
            }
            default:
              console.error("Unsupported d command:", instructions[i].command);
              break;
          }
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
        type={EdgeLayer}
        providerRef={lineProvider}
        config={{
          type: EdgeType.LINE,
          animate: {
            start: AutoEasingMethod.easeInCubic(2000),
            end: AutoEasingMethod.easeInCubic(2000),
          },
        }}
      />
      <LayerJSX
        type={EdgeLayer}
        providerRef={bezier2Provider}
        config={{
          type: EdgeType.BEZIER2,
          animate: {
            start: AutoEasingMethod.easeInCubic(2000),
            end: AutoEasingMethod.easeInCubic(2000),
          },
        }}
      />
      <LayerJSX
        type={EdgeLayer}
        providerRef={bezierProvider}
        config={{
          type: EdgeType.BEZIER,
          animate: {
            start: AutoEasingMethod.easeInCubic(2000),
            end: AutoEasingMethod.easeInCubic(2000),
          },
        }}
      />
      <LayerJSX type={CircleLayer} providerRef={circleProvider} config={{}} />
    </SurfaceJSX>
  );
}).bind({});
