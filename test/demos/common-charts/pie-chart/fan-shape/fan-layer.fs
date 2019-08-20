varying vec4 vertexColor;
varying vec4 vertexEdgeColor;
varying vec2 pos;
varying vec2 circleCenter;
varying vec2 vertexStart;
varying vec2 vertexEnd;

float getDistance(vec2 pos, vec2 center, vec2 end) {
  float r = 300.0;
  float d1 = distance(pos, center);
  float d2 = distance(pos, end);
  float a = (r * r + d1 * d1 - d2 * d2) * 0.5 / r;
  float d = d1 * d1 - a * a;

  return d1 * d1 + d2 * d2;
}

void main() {
  float d1 = getDistance(pos, circleCenter, vertexStart);
  float d2 = getDistance(pos, circleCenter, vertexEnd);

  setColor(
    mix(
      vertexColor, 
      vertexEdgeColor, 
      0.0
      /*float(
        d1 > 2.0 + 300.0 * 150.0 && d1 < 1.0 + 300.0 * 300.0 || 
        d2 > 2.0 + 300.0 * 150.0 && d2 < 1.0 + 300.0 * 300.0
      )*/
    )
  );
}
