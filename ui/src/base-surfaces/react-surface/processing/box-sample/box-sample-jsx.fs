${import: camera}
varying vec2 texCoord;

void main() {
  vec2 texelSize = 1.0 / viewSize;
  vec4 o = texelSize.xyxy * vec2(-delta, delta).xxyy;

  vec4 s =
    texture2D(color, texCoord + o.xy) + texture2D(color, texCoord + o.zy) +
    texture2D(color, texCoord + o.xw) + texture2D(color, texCoord + o.zw);

  gl_FragColor = s * 0.25;
}
