${import: projection, transform}

varying vec4 _color;

void main() {
    mat4 m1 = transform(s, r1, t1);
    vec4 t2 = vec4(0.0, leng1, 0.0, 1.0);
    mat4 m2 = m1 * transform(s, r2, t1);

    vec4 pos =  vec4(position.x * radius, position.y * (leng1 + leng2), position.z * radius, 1.0);
    vec4 world = weight1 * m1 * pos + weight2 * (m2 * (pos - t2) + m1 * t2);

    _color = weight1 * color + weight2 * vec4(0.0, 0.0, 1.0, 1.0);

    gl_Position = clipSpace(world.xyz);
}