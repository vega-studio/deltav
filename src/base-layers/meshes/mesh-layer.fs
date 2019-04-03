precision highp float;

varying vec4 vertexColor;
varying vec2 vertexTexture;

void main() {
    //texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0)));
    //vec2 coordinate = texture.xy + (texture.zw - texture.xy) * vertexTexture;
    gl_FragColor = texture2D(imageAtlas, vertexTexture) * vec4(vertexColor.rgb, 1.0);
    //if(gl_FragColor.a == 0.0) gl_FragColor = vec4(vertexColor.rgb, 1.0);
    //gl_FragColor = vec4(vertexColor.rgb, 1.0);
}