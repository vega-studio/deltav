precision highp float;

float PI = 3.14159265;
float PI_2 = 6.2831853;

/**
 * This is an approximation of sin that allows us to bypass hardware precision
 * limitations for sin.
 *
 * http://lab.polygonal.de/2007/07/18/fast-and-accurate-sinecosine-approximation/
 * This is a GPU adaptation of this method to provide optimal GPU performance for the operation
 */
float fsin(float x) {
  float sine;

  // Always wrap input angle to -PI..PI
  x += mix(
    mix(
      0.0,
      -PI_2, float(x > PI)
    ),
    PI_2, float(x < -PI)
  );

  // Compute sine
  sine = 1.27323954 * x;
  sine += mix(-1.0, 1.0, float(x < 0.0)) * 0.405284735 * x * x;
  sine = 0.225 * (sine * (mix(1.0, -1.0, float(sine < 0.0)) * sine) - sine) + sine;

  return sine;
}

/**
 * This is an approximation of cos that allows us to bypass hardware precision
 * limitations for cos.
 *
 * http://lab.polygonal.de/2007/07/18/fast-and-accurate-sinecosine-approximation/
 * This is a GPU adaptation of this method to provide optimal GPU performance for the operation
 */
float fcos(float x) {
  float sine;
  // Cos is the same as sine but
  x += 1.57079632;

  // Always wrap input angle to -PI..PI
  x += mix(
    mix(
      0.0,
      -PI_2, float(x > PI)
    ),
    PI_2, float(x < -PI)
  );

  // Compute sine
  sine = 1.27323954 * x;
  sine += mix(-1.0, 1.0, float(x < 0.0)) * 0.405284735 * x * x;
  sine = 0.225 * (sine * (mix(1.0, -1.0, float(sine < 0.0)) * sine) - sine) + sine;

  return sine;
}

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

vec2 interpolation(float t, vec2 center, float radius, float start, float end) {
  float angle = (end - start) * t + start;
  return center + vec2(fcos(angle) * radius, fsin(angle) * radius);
}

${extendHeader}

void main() {
  ${attributes}

  // Destructure some of the vec injections
  float startAngle = angle.x;
  float endAngle = angle.y;
  float widthStart = thickness.x;
  float widthEnd = thickness.y;
  // Destructure threejs's bug with the position requirement
  float normal = position.x;
  float interpolationTime = position.y;
  float interpolationIncrement = 1.0 / position.z;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, center, radius, startAngle, endAngle);
  // Get normal with currentPosition and center
  vec2 currentNormal = normalize(currentPosition - center);
  // Get the thickness based on the side we're on
  float lineThickness = mix(widthStart, widthEnd, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertex = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(colorStart, colorEnd, interpolationTime);
  vertexColor *= vertexColor.a;

  gl_Position = clipSpace(vec3(vertex, depth));

  ${extend}
}
