${import: projection}

precision highp float;

varying vec4 vertexColor;
varying vec2 vertexTexture;

void main() {
    ${attributes}

    vec4 aColor = vec4(0.0, 1.0, 0.0, 1.0);
    vec4 dColor = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 sColor = vec4(1.0, 1.0, 1.0, 1.0);

    //vec4 new_light = projection * modelView * vec4(light_position, 1.0);
    vec4 new_light = vec4(light_position, 1.0);
    //vec4 new_eye = projection * modelView * vec4(eye_position, 1.0);
    vec4 new_eye = vec4(eye_position, 1.0);

    //vec3 N = (normalMatrix * vec4(normal, 1.0)).xyz;
    vec3 N = normal;

    vec3 L = normalize(light_position - vec3(0.0));
    vec3 V = normalize(eye_position - position);
    //vec3 R = normalize(L + V);
    vec3 R = reflect(-L, normalize(N));

    float diffuseFactor = max(dot(normalize(N), L), 0.0);
    float specularFactor = pow(max(dot(R, V), 0.0), 0.8);

    if(diffuseFactor <= 0.0) specularFactor = 0.0;

    vec4 ambientColor = vec4(0.4, 0.4, 0.4, 1.0) * aColor;
    vec4 diffuseColor = diffuseFactor * vec4(diffuse, 1.0) * dColor;  
    vec4 specularColor = specularFactor * vec4(specular, 1.0) * sColor;

    vertexColor = ambientColor + diffuseColor + specularColor;
    //vertexTexture = tex;

    vertexTexture = texture.xy + (texture.zw - texture.xy) * tex;

    gl_Position = (projection * modelView) * vec4(position, 1.0);

    ${extend}
}  