precision highp float;

varying vec4 vertexColor;
varying vec2 vertexTexture;

void main() {
    gl_FragColor = texture2D(imageAtlas, vertexTexture) * vec4(vertexColor.rgb, 1.0);
    //gl_FragColor = vec4(vertexColor.rgb, 1.0);
}