varying vec4 _color;
varying vec2 _texCoord;

void main() {
    gl_FragColor = mix(
        _color,
        vec4(0.0, 0.0, 0.0, 1.0),
        float(_texCoord.x <= 0.01 || _texCoord.x > 0.99 ||_texCoord.y < 0.02 || _texCoord.y > 0.98)
    );
}