${import: projection, transform}

varying vec4 _color;
varying vec2 _texCoord;

void main() {
    mat4 m = transform(s, r, t);
    vec4 pos =  vec4(position.x * radius, position.y * len, position.z * radius, 1.0);
    vec4 world = m * pos;

    _color = color;
    _texCoord = texCoord;

    gl_Position = clipSpace(world.xyz);
}