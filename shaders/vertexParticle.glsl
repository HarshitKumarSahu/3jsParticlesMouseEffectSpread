uniform float time;
uniform vec3 mousePos;
uniform float isMouseOver;
uniform float progress;
varying vec3 vPosition;

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

// Simple hash function to generate random positions
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

// void main() {


//org
void main() {
    // Generate random initial position
    vPosition = position;
    vec3 randomPos;
    randomPos.x = (hash(position.x + position.y + position.z) - 0.5) * 1000.0;
    randomPos.y = (hash(position.y + position.z + 1.234) - 0.5) * 1000.0;
    randomPos.z = (hash(position.z + position.x + 2.345) - 0.5) * 500.0;

    // Apply orbiting effect around the center (y-axis rotation)
    float orbitRadius = length(randomPos.xz); // Distance from y-axis
    float orbitAngle = - time * 0.175 + hash(position.x + position.y) * 6.283185; // Base angle + random offset
    float noiseOffset = 100.0 * snoise(vec4(randomPos.x, randomPos.y, randomPos.z, time / 3.75));
    orbitRadius += noiseOffset; // Add noise to radius for organic variation
    randomPos.x = orbitRadius * cos(orbitAngle);
    randomPos.z = orbitRadius * sin(orbitAngle);

    // Interpolate between orbiting random position and model position
    vec3 newPos = mix(randomPos, position, progress);

    // Apply mouse distortion when isMouseOver is active
    if (isMouseOver > 0.5) {
        float distance = 100.0;
        float distToMouse = length(newPos - mousePos);
        if (distToMouse < distance) {
            vec3 noisePos;
            noisePos.x = 250.0 * snoise(vec4(newPos.x, newPos.y, newPos.z, time / 3.75));
            noisePos.y = newPos.y + 10.0 * snoise(vec4(newPos.x, newPos.y, newPos.z, time / 3.75));
            noisePos.z = 250.0 * snoise(vec4(newPos.x * 0.5, newPos.y * 0.5, newPos.z * 0.5, time / 3.75));
            
            float koef = distToMouse / distance;
            koef = sqrt(koef);
            newPos = mix(newPos, noisePos, 1.0 - koef);
        }
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    gl_PointSize = 1450.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}





//     float distance = 100.;

//     vec3 newPos = position;

//     if(isMouseOver > 0.5) {
//         vec3 noisePos;

//         noisePos.x = 250. * snoise(vec4(position.x, position.y, position.z, time / 3.75));
//         noisePos.y = newPos.y + 10. * snoise(vec4(position.x, position.y, position.z, time / 3.75));
//         noisePos.z = 250. * snoise(vec4(position.x * 0.5, position.y * 0.5, position.z * 0.5, time / 3.75));

//         if(length(position - mousePos) < distance) {
//             float koef = length(position - mousePos) / distance;
//             koef = sqrt(koef);
//             // newPos *= vec3(1. + koef, 1., 2. + koef);
//             newPos = mix(newPos, noisePos, 1. - koef);
//         }
//     }

//     vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
//     gl_PointSize = 700. * ( 1. / - mvPosition.z);
//     gl_Position = projectionMatrix * mvPosition;
// }

// void main() {
//     // Generate random initial position (spread across a large volume)
//     vec3 randomPos;
//     randomPos.x = (hash(position.x + position.y + position.z) - 0.5) * 1000.0; // Spread in x
//     randomPos.y = (hash(position.y + position.z + 1.234) - 0.5) * 1000.0; // Spread in y
//     randomPos.z = (hash(position.z + position.x + 2.345) - 0.5) * 1000.0; // Spread in z
    
//     randomPos += 100.0 * snoise(vec4(randomPos.x, randomPos.y , randomPos.z , time / 3.75));

//     // Interpolate between random position and model position based on progress
//     vec3 newPos = mix(randomPos, position, progress);

//     // Apply mouse distortion only when isMouseOver is active
//     if (isMouseOver > 0.5) {
//         float distance = 100.0;
//         float distToMouse = length(newPos - mousePos);
//         if (distToMouse < distance) {
//             vec3 noisePos;
//             noisePos.x = 250.0 * snoise(vec4(newPos.x, newPos.y, newPos.z, time / 3.75));
//             noisePos.y = newPos.y + 10.0 * snoise(vec4(newPos.x, newPos.y, newPos.z, time / 3.75));
//             noisePos.z = 250.0 * snoise(vec4(newPos.x * 0.5, newPos.y * 0.5, newPos.z * 0.5, time / 3.75));
            
//             float koef = distToMouse / distance;
//             koef = sqrt(koef);
//             newPos = mix(newPos, noisePos, 1.0 - koef);
//         }
//     }

//     vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
//     gl_PointSize = 700.0 * (1.0 / -mvPosition.z);
//     gl_Position = projectionMatrix * mvPosition;
// }