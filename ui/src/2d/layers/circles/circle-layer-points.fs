precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;

float circle(vec2 coord, float radius){
  vec2 dist = coord - vec2(0.5);

  return 1.0 - smoothstep(
    radius - (radius * edgeSharpness),
    radius + (radius * edgeSharpnessBase),
    dot(dist, dist) * 4.0
  );
}

void main() {
  float step_factor = circle(gl_PointCoord, 1.0);

  // ${out: color} = hey
  ${out: color} = mix(
    vec4(0.0, 0.0, 0.0, 0.0),
    vertexColor,
    step_factor
  );

  if (color.a == 0.0) discard;
}
