precision highp float;

varying vec4 vertexColor;
varying vec2 vertexTexture;
varying float enableTexture;

void main() {
    gl_FragColor = mix(
        vec4(vertexColor.rgb, 1.0),
        texture2D(imageAtlas, vertexTexture) * vec4(vertexColor.rgb, 1.0),
        enableTexture
    );
}