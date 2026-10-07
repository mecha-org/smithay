#version 100

precision mediump float;
uniform vec4 color;

// Gamut correction matrix M: sRGB-linear -> panel-native-linear.
// Row-major: each row produces one output channel (out = M . in), matching the
// reference gamut-preview simulation:
//   out.r = 0.792239*r + 0.244734*g + 0.016091*b
//   out.g = 0.037262*r + 0.935151*g + 0.020839*b
//   out.b = 0.012408*r + 0.061623*g + 0.809798*b
const vec3 M_R = vec3(0.792239, 0.244734, 0.016091);
const vec3 M_G = vec3(0.037262, 0.935151, 0.020839);
const vec3 M_B = vec3(0.012408, 0.061623, 0.809798);

// Apply the correction in linear light with a pure gamma 2.2 transfer:
// decode -> matrix -> clamp -> encode.
vec3 correct_gamut(vec3 c) {
    vec3 lin = pow(c, vec3(2.2));
    vec3 corr = vec3(dot(M_R, lin), dot(M_G, lin), dot(M_B, lin));
    corr = clamp(corr, 0.0, 1.0);
    return pow(corr, vec3(1.0 / 2.2));
}

void main() {
    gl_FragColor = vec4(correct_gamut(color.rgb), color.a);
}
