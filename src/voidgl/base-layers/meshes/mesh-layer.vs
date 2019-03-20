${import: projection}

precision highp float;

varying vec4 vertexColor;

void main() {
    ${attributes}

    vertexColor = vec4(1.0, 1.0, 0.0, 1.0);

    // gl_Position = clipSpace(vec3(vertex, depth));
    float d = depth;
    // gl_Position = clipSpace(vec3((position.xy + vec2(1.0, 1.0)) * 200.0, 200.0));
    // gl_Position = vec4(position.xy, 0.4,  1.0);

    //gl_Position = clipSpace(position);

    gl_Position = projection * modelView * vec4(position, 1.0);

    ${extend}
} 