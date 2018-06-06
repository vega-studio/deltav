precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying vec2 pointCoord;

float circle(vec2 coord, float radius){
  vec2 dist = coord - vec2(0.5);

  return 1.0 - smoothstep(
    radius - (radius * edgeSharpness),
    radius + (radius * 0.01),
    dot(dist, dist) * 4.0
  );
}

void main() {
  float step_factor = circle(pointCoord, 1.0);
  gl_FragColor = mix(
    vec4(0.0, 0.0, 0.0, 0.0),
    vertexColor,
    step_factor
  );
}
