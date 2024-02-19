/**
 * The code for the single lines are credited to Twigl team and some examples
 * posted to their work. These are under MIT License as posted under their repo.
 *
 * Kaleidoscope: https://twigl.app
 * Mountains: https://twigl.app/?ol=true&ss=-NqtlWkb_ik-IVaJRbEQ
 * Glow: https://twigl.app/?mode=0&source=precision%20highp%20float;%0Auniform%20float%20time;%0Avoid%20main()%7Bvec4%20p%3Dvec4((gl_FragCoord.xy/4e2),0,-4);for(int%20i%3D0;i%3C9;%2B%2Bi)p%2B%3Dvec4(sin(-(p.x%2Btime*.2))%2Batan(p.y*p.w),cos(-p.x)%2Batan(p.z*p.w),cos(-(p.x%2Bsin(time*.8)))%2Batan(p.z*p.w),0);gl_FragColor%3Dp;%7D
 */

import React from "react";
import {
  ClearFlags,
  GLSettings,
  ShaderInjectionTarget,
  ShaderModule,
  TextureJSX,
  TextureSize,
} from "../../src";
import { PostProcessJSX } from "../../src/base-surfaces/react-surface/processing/post-process-jsx";
import { StoryFn } from "@storybook/react";
import { SurfaceJSX } from "../../src/base-surfaces/react-surface/surface-jsx";

export default {
  title: "Deltav/One Liners",
  args: {},
  argTypes: {},
};

ShaderModule.register({
  moduleId: "twigl",
  description: "Twigl compatibility module",
  compatibility: ShaderInjectionTarget.FRAGMENT,
  content: `
    vec3 hsv(float h, float s, float v){
      vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
      return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
    }

    mat2 rotate2D(float r){
      return mat2(cos(r), sin(r), -sin(r), cos(r));
    }

    mat3 rotate3D(float angle, vec3 axis){
      vec3 a = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float r = 1.0 - c;
      return mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
      );
    }

    const float PI = 3.141592653589793;
    const float PI2 = PI * 2.0;
  `,
});

export const Kaleidoscope: StoryFn = (() => {
  return (
    <SurfaceJSX
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {PostProcessJSX({
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        buffers: {
          buffer: "buffer",
        },
        shader: `
          $\{import: frame, camera}

          void main() {
            vec2 FC = gl_FragCoord.xy;
            vec2 r = buffer_size, p = (FC * 2.f - r) / min(r.x, r.y);
            for (int i = 0; i < 8; ++i) {
              p.xy = abs(p) / dot(p, p) - vec2(.9f + cos(currentTime * .0002f) * .4f);
            }
            gl_FragColor = vec4(p.xxy, 1);
          }
        `,
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Glow: StoryFn = (() => {
  return (
    <SurfaceJSX
      options={{
        alpha: true,
        antialias: true,
      }}
      pixelRatio={0.5}
    >
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {PostProcessJSX({
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        buffers: {
          buffer: "buffer",
        },
        shader: `
          $\{import: frame, camera}

          void main() {
            float time = currentTime / 1000.;
            vec4 p=vec4((gl_FragCoord.xy/4e2),0,-4);for(int i=0;i<9;++i)p+=vec4(sin(-(p.x+time*.2))+atan(p.y*p.w),cos(-p.x)+atan(p.z*p.w),cos(-(p.x+sin(time*.8)))+atan(p.z*p.w),0);gl_FragColor=p;
          }
        `,
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Mountains: StoryFn = (() => {
  return (
    <SurfaceJSX
      options={{
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
      }}
      pixelRatio={0.5}
    >
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN_HALF}
        height={TextureSize.SCREEN_HALF}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {PostProcessJSX({
        view: {
          config: {
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        buffers: {
          buffer: "buffer",
        },
        shader: `
          $\{import: twigl, frame, camera}

          void main() {
            vec2 r = buffer_size;
            vec2 FC = gl_FragCoord.xy;
            float t = currentTime / 1000.;
            $\{out: o};

            o++;vec3 p,c=vec3(8,6,7)/6e2;for(float q=2.,e,i,a,g,h,k;i++<2e2;g+=a=min(e,h-q)/3.,o-=mix(c.ggbr,c.rgrr+h/7e2,h-q)/exp(a*a*1e7)/h)for(p=vec3((FC.xy-r/q)/r.y*g,g),e=p.y-g*.7+q,p.z+=t,h=e+p.x*.4,a=q;a<5e2;a/=.8)p.xz*=rotate2D(q),h-=exp(sin(k=p.z*a)/a-1.)-.44,e-=exp(sin(k+t+t)-q)/a;

            _FragColor = o;
          }
        `,
      })}
    </SurfaceJSX>
  );
}).bind({});
