${import: projection}

precision highp float;

varying vec4 vertexColor;
varying vec2 vertexTexture;
varying float enableTexture;

mat4 translation4x4(vec4 vec) {
    return mat4(
        1.0, 0.0, 0.0, 0.0, 
        0.0, 1.0, 0.0, 0.0, 
        0.0, 0.0, 1.0, 0.0, 
        vec[0], vec[1], vec[2], 1.0
    );
}

mat4 rotationQuaternion(vec4 q) {
    float x2 = q[1] + q[1];
    float y2 = q[2] + q[2];
    float z2 = q[3] + q[3];
    float xx = q[1] * x2;
    float xy = q[1] * y2;
    float xz = q[1] * z2;
    float yy = q[2] * y2;
    float yz = q[2] * z2;
    float zz = q[3] * z2;
    float wx = q[0] * x2;
    float wy = q[0] * y2;
    float wz = q[0] * z2;
    /*
        // r0
        1.0 - 2.0 * s * (q[1] * q[1] + q[2] * q[2]),
        // r1
        2.0 * s * (q[0] * q[1] + q[2] * q[3]),
        // r2
        2.0 * s * (q[0] * q[2] - q[1] * q[3]),
        // r3
        0.0,
        // r4
        2.0 * s * (q[0] * q[1] - q[2] * q[3]),
        // r5
        1.0 - 2.0 * s * (q[0] * q[0] + q[2] * q[2]),
        // r6
        2.0 * s * (q[1] * q[2] + q[0] * q[3]),
        // r7
        0.0,
        // r8
        2.0 * s * (q[0] * q[2] + q[1] * q[3]),
        // r9
        2.0 * s * (q[1] * q[2] - q[0] * q[3]),
        // r10
        1.0 - 2.0 * s * (q[0] * q[0] + q[1] * q[1]),
        // r11
        0.0,
        // r12
        0.0,
        // r13
        0.0,
        // r14
        0.0,
        // r15
        1.0
    */

    return mat4(
        // r0
        1.0 - yy - zz,
        // r1
        xy - wz,
        // r2
        xz + wy,
        // r3
        0.0,
        // r4
        xy + wz,
        // r5
        1.0 - xx - zz,
        // r6
        yz - wx,
        // r7
        0.0,
        // r8
        xz - wy,
        // r9
        yz + wx,
        // r10
        1.0 - xx - yy,
        // r11
        0.0,
        // r12
        0.0,
        // r13
        0.0,
        // r14
        0.0,
        // r15
        1.0
    );
}

mat4 scale4(vec4 vec) {
    return mat4(
        vec[0], 0.0, 0.0, 0.0, 
        0.0, vec[1], 0.0, 0.0, 
        0.0, 0.0, vec[2], 0.0, 
        0.0, 0.0, 0.0, 1.0
    );
}

void main() {
    ${attributes}

    vec4 aColor = ambient_color;
    vec4 dColor = diffuse_color;
    vec4 sColor = specular_color;

    mat4 transformMatrix = rotationQuaternion(quaternion) * translation4x4(transform) * scale4(scale);
    
    vec4 newPosition =  transformMatrix * vec4(position, 1.0);

    vec3 N = (rotationQuaternion(quaternion) * vec4(normal, 1.0)).xyz;

    vec3 L = normalize(mix(light_position, light_position - newPosition.xyz, light_type));
    vec3 V = normalize(cameraPosition - newPosition.xyz);
    //vec3 V = normalize(vec3(200.0, 200.0, 200.0) - newPosition.xyz);
    vec3 R = reflect(-L, normalize(N));

    float diffuseFactor = max(dot(normalize(N), -L), 0.0);
    float specularFactor = pow(max(dot(R, V), 0.0), 0.8);

    if(diffuseFactor <= 0.0) specularFactor = 0.0;

    vec4 ambientColor = vec4(0.4, 0.4, 0.4, 1.0) * aColor;
    vec4 diffuseColor = diffuseFactor * vec4(diffuse, 1.0) * dColor;  
    vec4 specularColor = specularFactor * vec4(specular, 1.0) * sColor;

    vertexColor = ambientColor + diffuseColor + specularColor;
    //vertexColor = vec4(1.0, 0.0, 0.0, 1.0);

    vertexTexture = texture.xy + (texture.zw - texture.xy) * tex;

    enableTexture = has_texture;

    gl_Position = (projection * modelView) * newPosition;

    ${extend}
}  