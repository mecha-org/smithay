#version 100

precision mediump float;
uniform vec4 color;

// Color transformation matrix, applied to the output RGB.
// Values are transposed into GLSL's column-major layout so that
// COLOR_MATRIX * rgb yields out = M . in for the row-major source matrix:
//   out.r = 0.792239*r + 0.244734*g + 0.016091*b
//   out.g = 0.037262*r + 0.935151*g + 0.020839*b
//   out.b = 0.012408*r + 0.061623*g + 0.809798*b
const mat3 COLOR_MATRIX = mat3(
    0.792239, 0.037262, 0.012408, // column 0
    0.244734, 0.935151, 0.061623, // column 1
    0.016091, 0.020839, 0.809798  // column 2
);

void main() {
    gl_FragColor = vec4(COLOR_MATRIX * color.rgb, color.a);
}