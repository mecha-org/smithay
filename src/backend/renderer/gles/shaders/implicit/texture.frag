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

// Color transformation matrix, applied to the final output RGB.
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

#if defined(DEBUG_FLAGS)
uniform float tint;
#endif

void main() {
    vec4 color = texture2D(tex, v_coords);

#if defined(NO_ALPHA)
    color = vec4(color.rgb, 1.0) * alpha;
#else
    color = color * alpha;
#endif

#if defined(DEBUG_FLAGS)
    if (tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif

    color = vec4(COLOR_MATRIX * color.rgb, color.a);

    gl_FragColor = color;
}