#version 100

//_DEFINES_

#if defined(EXTERNAL)
#extension GL_OES_EGL_image_external : require
#endif

precision highp float;
#if defined(EXTERNAL)
uniform samplerExternalOES tex;
#else
uniform sampler2D tex;
#endif

uniform float alpha;
varying vec2 v_coords;

#if defined(DEBUG_FLAGS)
uniform float tint;
#endif

// Gamut correction matrix M: sRGB-linear -> panel-native-linear.
// Row-major: each row produces one output channel (out = M . in), matching the
// reference gamut-preview simulation. Rows are stored as vec3 so the shader
// reads exactly like the source matrix, with no column-major transposition:
//   out.r = 0.792239*r + 0.244734*g + 0.016091*b
//   out.g = 0.037262*r + 0.935151*g + 0.020839*b
//   out.b = 0.012408*r + 0.061623*g + 0.809798*b
const vec3 M_R = vec3(0.792239, 0.244734, 0.016091);
const vec3 M_G = vec3(0.037262, 0.935151, 0.020839);
const vec3 M_B = vec3(0.012408, 0.061623, 0.809798);

// Apply the correction in linear light with a pure gamma 2.2 transfer:
// decode -> matrix -> clamp -> encode. This maps sRGB content to the drive
// values that make the wide-gamut panel reproduce the intended sRGB color.
vec3 correct_gamut(vec3 c) {
    vec3 lin = pow(c, vec3(2.2));
    vec3 corr = vec3(dot(M_R, lin), dot(M_G, lin), dot(M_B, lin));
    corr = clamp(corr, 0.0, 1.0);
    return pow(corr, vec3(1.0 / 2.2));
}

void main() {
    vec4 color = texture2D(tex, v_coords);
    color = vec4(correct_gamut(color.rgb), color.a);

#if defined(NO_ALPHA)
    color = vec4(color.rgb, 1.0) * alpha;
#else
    color = color * alpha;
#endif

#if defined(DEBUG_FLAGS)
    if (tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif

    gl_FragColor = color;
}
