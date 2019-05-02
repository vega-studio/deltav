precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;
varying vec2 pointCoord;

float circle(vec2 coord, float radius){
  vec2 dist = coord - vec2(0.5);

  return 1.0 - smoothstep(
    radius - (radius * edgeSharpness),
    radius + (radius * edgeSharpnessBase),
    dot(dist, dist) * 4.0
  );
}

${extendHeader}

void main() {
  float step_factor = circle(pointCoord.xy, 1.0);

  setColor(mix(
    vec4(0.0, 0.0, 0.0, 0.0),
    vertexColor,
    step_factor
  ));

  if (gl_FragColor.a <= 0.0) discard;

  ${extend}
}
