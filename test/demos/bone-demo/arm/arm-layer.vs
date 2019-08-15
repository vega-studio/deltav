${import: projection, transform}

varying vec4 _color;

void main() {
    mat4 m = transform(s, r1, t);
    vec4 pos =  vec4(position.x * radius, position.y * (leng1 + leng2), position.z * radius, 1.0);
    vec4 world = m * pos;

    _color = color;

    gl_Position = clipSpace(world.xyz);
}