// vec2 hash22(vec2 p) {
//   p = fract(p * vec2(5.3983, 5.4427));
//   p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
//   return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
// }

void main() {
    // gl_FragColor = vec4(1.0, 0.4353, 0.0, 1.0);
    gl_FragColor = vec4(1.0, 0.3922, 0.1686, 1.0);

}
