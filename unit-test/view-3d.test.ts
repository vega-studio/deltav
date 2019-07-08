/**
 * These tests are to test the math the view provides to project coordinates from screen to world and vice versa
 */
import assert from 'assert';
import { describe, it } from 'mocha';
import { View3D } from '../src/3d/view/view-3d';
import { TO_RADIANS } from '../src/constants';
import { Camera, CameraProjectionType } from '../src/util/camera';

const ORIGIN_CAMERA: Camera = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: 500,
  height: 500,
  near: 1,
  far: 1000000,
  fov: 90 * TO_RADIANS,
});

const SIMPLE_VIEW = new View3D(
  undefined,
  {
    key: '',
    camera: ORIGIN_CAMERA,
    viewport: {
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    }
  }
);

describe('View 3D projections', () => {
  it ('Should project from world to the screen', () => {

  });
});
