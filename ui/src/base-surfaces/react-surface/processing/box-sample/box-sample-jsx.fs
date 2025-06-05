${import: camera}

void main() {
  vec2 texelSize = 1.0 / viewSize;
  vec4 o = texelSize.xyxy * vec2(-delta, delta).xxyy;

  vec4 s =
    texture2D(sourceTex, texCoord + o.xy) + texture2D(sourceTex, texCoord + o.zy) +
    texture2D(sourceTex, texCoord + o.xw) + texture2D(sourceTex, texCoord + o.zw);

  ${out: color} = s * 0.25;
}
