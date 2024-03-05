/**
 * The code for the single lines are credited to Twigl team and some examples
 * posted to their work. These are under MIT License as posted under their repo.
 *
 * Kaleidoscope: https://twigl.app
 * Mountains: https://twigl.app/?ol=true&ss=-NqtlWkb_ik-IVaJRbEQ
 * Glow: https://twigl.app/?mode=0&source=precision%20highp%20float;%0Auniform%20float%20time;%0Avoid%20main()%7Bvec4%20p%3Dvec4((gl_FragCoord.xy/4e2),0,-4);for(int%20i%3D0;i%3C9;%2B%2Bi)p%2B%3Dvec4(sin(-(p.x%2Btime*.2))%2Batan(p.y*p.w),cos(-p.x)%2Batan(p.z*p.w),cos(-(p.x%2Bsin(time*.8)))%2Batan(p.z*p.w),0);gl_FragColor%3Dp;%7D
 */
import { StoryFn } from "@storybook/react";
declare const _default: {
    title: string;
    args: {};
    argTypes: {};
};
export default _default;
export declare const Kaleidoscope: StoryFn;
export declare const Glow: StoryFn;
export declare const Mountains: StoryFn;
