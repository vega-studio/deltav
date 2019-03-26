${import: projection}

precision highp float;

varying vec4 vertexColor;

void main() {
    ${attributes}

    vec4 aColor = vec4(0.0, 0.0, 1.0, 1.0);
    vec4 dColor = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 sColor = vec4(0.3, 0.0, 0.0, 1.0);

    //vec4 new_light = projection * modelView * vec4(light_position, 1.0);
    vec4 new_light = vec4(light_position, 1.0);
    //vec4 new_eye = projection * modelView * vec4(eye_position, 1.0);
    vec4 new_eye = vec4(eye_position, 1.0);

    vec4 L = vec4(normalize(new_light.xyz - position), 1.0);
    vec4 V = vec4(normalize(new_eye.xyz - position), 1.0);
    vec4 R = vec4(normalize(L.xyz + V.xyz), 1.0);

    float diffuseFactor = max(dot(L.xyz, normalize(normal)), 0.0);
    float specularFactor = max(dot(R.xyz, V.xyz), 0.0);

    vec4 ambientColor = vec4(ambient, 1.0) * aColor ;
    vec4 diffuseColor = diffuseFactor * vec4(diffuse, 1.0) * dColor;  
    vec4 specularColor = pow(specularFactor, illumination) * vec4(specular, 1.0) * sColor;

    vertexColor = ambientColor + diffuseColor + specularColor;

    gl_Position = (projection * modelView) * vec4(position, 1.0);

    ${extend}
} 