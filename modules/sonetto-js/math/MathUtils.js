// Sourced from Three.js
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function clamp( value, min, max ) {
	return Math.max( min, Math.min( max, value ) );
}

// compute euclidean modulo of m % n
// https://en.wikipedia.org/wiki/Modulo_operation
function euclideanModulo( n, m ) {
	return ( ( n % m ) + m ) % m;
}

// Linear mapping from range <a1, a2> to range <b1, b2>
function mapLinear( x, a1, a2, b1, b2 ) {
	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}

// https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/
function inverseLerp( x, y, value ) {
	if ( x !== y ) {
		return ( value - x ) / ( y - x );
	} else {
		return 0;
	}
}

// https://en.wikipedia.org/wiki/Linear_interpolation
function lerp( x, y, t ) {
	return ( 1 - t ) * x + t * y;
}

// http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
function damp( x, y, lambda, dt ) {
	return lerp( x, y, 1 - Math.exp( - lambda * dt ) );
}

// https://www.desmos.com/calculator/vcsjnyz7x4
function pingpong( x, length = 1 ) {
	return length - Math.abs( euclideanModulo( x, length * 2 ) - length );
}

// http://en.wikipedia.org/wiki/Smoothstep
function smoothstep( x, min, max ) {
	if ( x <= min ) return 0;
	if ( x >= max ) return 1;

	x = ( x - min ) / ( max - min );

	return x * x * ( 3 - 2 * x );
}

function smootherstep( x, min, max ) {
	if ( x <= min ) return 0;
	if ( x >= max ) return 1;

	x = ( x - min ) / ( max - min );

	return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
}

// Random integer from <low, high> interval
function randInt( low, high ) {

	return low + Math.floor( Math.random() * ( high - low + 1 ) );

}

// Random float from <low, high> interval
function randFloat( low, high ) {

	return low + Math.random() * ( high - low );

}

// Random float from <-range/2, range/2> interval
function randFloatSpread( range ) {

	return range * ( 0.5 - Math.random() );

}

// Deterministic pseudo-random float in the interval [ 0, 1 ]
function seededRandom( s ) {

	if ( s !== undefined ) _seed = s;

	// Mulberry32 generator

	let t = _seed += 0x6D2B79F5;

	t = Math.imul( t ^ t >>> 15, t | 1 );

	t ^= t + Math.imul( t ^ t >>> 7, t | 61 );

	return ( ( t ^ t >>> 14 ) >>> 0 ) / 4294967296;

}

function degToRad( degrees ) {

	return degrees * DEG2RAD;

}

function radToDeg( radians ) {

	return radians * RAD2DEG;

}

function isPowerOfTwo( value ) {

	return ( value & ( value - 1 ) ) === 0 && value !== 0;

}

function ceilPowerOfTwo( value ) {

	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

}

function floorPowerOfTwo( value ) {

	return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

}

function setQuaternionFromProperEuler( q, a, b, c, order ) {
	// Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

	// rotations are applied to the axes in the order specified by 'order'
	// rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
	// angles are in radians

	const cos = Math.cos;
	const sin = Math.sin;

	const c2 = cos( b / 2 );
	const s2 = sin( b / 2 );

	const c13 = cos( ( a + c ) / 2 );
	const s13 = sin( ( a + c ) / 2 );

	const c1_3 = cos( ( a - c ) / 2 );
	const s1_3 = sin( ( a - c ) / 2 );

	const c3_1 = cos( ( c - a ) / 2 );
	const s3_1 = sin( ( c - a ) / 2 );

	switch ( order ) {
		case 'XYX':
			q.set( c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13 );
			break;

		case 'YZY':
			q.set( s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13 );
			break;

		case 'ZXZ':
			q.set( s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13 );
			break;

		case 'XZX':
			q.set( c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13 );
			break;

		case 'YXY':
			q.set( s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13 );
			break;

		case 'ZYZ':
			q.set( s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13 );
			break;

		default:
			console.warn( 'SonettoJS.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + order );
	}
}

function denormalize( value, array ) {
	switch ( array.constructor ) {
		case Float32Array:
			return value;

		case Uint32Array:
			return value / 4294967295.0;

		case Uint16Array:
			return value / 65535.0;

		case Uint8Array:
			return value / 255.0;

		case Int32Array:
			return Math.max( value / 2147483647.0, - 1.0 );

		case Int16Array:
			return Math.max( value / 32767.0, - 1.0 );

		case Int8Array:
			return Math.max( value / 127.0, - 1.0 );

		default:

			throw new Error( 'Invalid component type.' );
	}
}

function normalize( value, array ) {
	switch ( array.constructor ) {
		case Float32Array:
			return value;

		case Uint32Array:
			return Math.round( value * 4294967295.0 );

		case Uint16Array:
			return Math.round( value * 65535.0 );

		case Uint8Array:
			return Math.round( value * 255.0 );

		case Int32Array:
			return Math.round( value * 2147483647.0 );

		case Int16Array:
			return Math.round( value * 32767.0 );

		case Int8Array:
			return Math.round( value * 127.0 );

		default:
			throw new Error( 'Invalid component type.' );
	}
}

const MathUtils = {
	DEG2RAD: DEG2RAD,
	RAD2DEG: RAD2DEG,
	clamp: clamp,
	euclideanModulo: euclideanModulo,
	mapLinear: mapLinear,
	inverseLerp: inverseLerp,
	lerp: lerp,
	damp: damp,
	pingpong: pingpong,
	smoothstep: smoothstep,
	smootherstep: smootherstep,
	randInt: randInt,
	randFloat: randFloat,
	randFloatSpread: randFloatSpread,
	seededRandom: seededRandom,
	degToRad: degToRad,
	radToDeg: radToDeg,
	isPowerOfTwo: isPowerOfTwo,
	ceilPowerOfTwo: ceilPowerOfTwo,
	floorPowerOfTwo: floorPowerOfTwo,
	setQuaternionFromProperEuler: setQuaternionFromProperEuler,
	normalize: normalize,
	denormalize: denormalize
};

export {
	DEG2RAD,
	RAD2DEG,
	clamp,
	euclideanModulo,
	mapLinear,
	inverseLerp,
	lerp,
	damp,
	pingpong,
	smoothstep,
	smootherstep,
	randInt,
	randFloat,
	randFloatSpread,
	seededRandom,
	degToRad,
	radToDeg,
	isPowerOfTwo,
	ceilPowerOfTwo,
	floorPowerOfTwo,
	setQuaternionFromProperEuler,
	normalize,
	denormalize,
	MathUtils
};