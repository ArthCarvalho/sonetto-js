// Sourced from Three.js
import {
  REVISION,
  WebGLCoordinateSystem
} from '../constants.js';

import { Frustum } from '../math/Frustum.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';

import { WebGLCapabilities } from './webgl/WebGLCapabilities.js';
import { WebGLExtensions } from './webgl/WebGLExtensions.js';

class WebGLRenderer {
  constructor(parameters = {}) {
    const {
			canvas = null,
			context = null,
			depth = true,
			stencil = true,
			alpha = false,
			antialias = false,
			premultipliedAlpha = true,
			preserveDrawingBuffer = false,
			powerPreference = 'default',
			failIfMajorPerformanceCaveat = false,
		} = parameters;

    this.isWebGLRenderer = true;

    let _alpha;

    if(context !== null) {
      _alpha = context.getContextAttributes().alpha;
    } else {
      _alpha = alpha;
    }

    // Public properties
    this.domElement = canvas;

    // Internal properties
    const _this = this;

    let _isContextLost = false;

    // Pixel Properties
    let _width = canvas.width;
		let _height = canvas.height;

		let _pixelRatio = 1;
		let _opaqueSort = null;
		let _transparentSort = null;

    const _viewport = new Vector4(0, 0, _width, _height);
		const _scissor = new Vector4(0, 0, _width, _height);
		let _scissorTest = false;

    // frustum
		const _frustum = new Frustum();

		// clipping
		let _clippingEnabled = false;
		let _localClippingEnabled = false;

    // camera matrix cache
    const _projScreenMatrix = new Matrix4();

		const _vector2 = new Vector2();
		const _vector3 = new Vector3();

    function getTargetPixelRatio() {
			return _currentRenderTarget === null ? _pixelRatio : 1;
		}

    // Initialize
    let _gl = context;

    function getContext(contextNames, contextAttributes) {
			for(let i = 0; i < contextNames.length; i ++) {
				const contextName = contextNames[i];
				const context = canvas.getContext(contextName, contextAttributes);
				if(context !== null) return context;
			}

			return null;
		}

    try {
      const contextAttributes = {
        alpha: true,
				depth,
				stencil,
				antialias,
				premultipliedAlpha,
				preserveDrawingBuffer,
				powerPreference,
				failIfMajorPerformanceCaveat,
      };

      // OffscreenCanvas does not have setAttribute
			if('setAttribute' in canvas) canvas.setAttribute('data-engine', `SonettoJS r${REVISION}`);

      // event listeners must be registered before WebGL context is created
			canvas.addEventListener('webglcontextlost', onContextLost, false);
			canvas.addEventListener('webglcontextrestored', onContextRestore, false);
			canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);

      if(_gl === null) {
        const contextNames = ['webgl2', 'webgl', 'experimental-webgl'];

        if(_this.isWebGL1Renderer === true) {
					contextNames.shift();
				}

        _gl = getContext(contextNames, contextAttributes);

        if(_gl === null) {
          if(getContext(contextNames)) {
						throw new Error('Error creating WebGL context with your selected attributes.');
					} else {
						throw new Error('Error creating WebGL context.');
					}
        }
  
        // Some experimental-webgl implementations do not have getShaderPrecisionFormat
        if(_gl.getShaderPrecisionFormat === undefined) {
          _gl.getShaderPrecisionFormat = function () {
            return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };
          };
        }
      }
    } catch(error) {
      console.error('SonettoJS.WebGLRenderer: ' + error.message);
			throw error;
    }

    let extensions, capabilities;

    function initGLContext() {
      extensions = new WebGLExtensions(_gl);

      capabilities = new WebGLCapabilities(_gl, extensions, parameters);

      extensions.init(capabilities);
    }

    initGLContext();

    _this.capabilities = capabilities;
    _this.extensions = extensions;

    this.getContext = function () {
			return _gl;
		};

    this.getContextAttributes = function () {
			return _gl.getContextAttributes();
		};

    this.forceContextLoss = function () {
			const extension = extensions.get('WEBGL_lose_context');
			if(extension) extension.loseContext();
		};

		this.forceContextRestore = function () {
			const extension = extensions.get('WEBGL_lose_context');
			if(extension) extension.restoreContext();
		};

    this.getPixelRatio = function () {
			return _pixelRatio;
		};

    this.setPixelRatio = function (value) {
			if(value === undefined) return;

			_pixelRatio = value;

			this.setSize(_width, _height, false);
		};

    this.getSize = function (target) {
			return target.set(_width, _height);
		};

    this.setSize = function (width, height, updateStyle = true) {
      _width = width;
			_height = height;

      canvas.width = Math.floor(width * _pixelRatio);
			canvas.height = Math.floor(height * _pixelRatio);

      if(updateStyle === true) {
				canvas.style.width = width + 'px';
				canvas.style.height = height + 'px';
			}

      this.setViewport(0, 0, width, height);
    };

    this.getDrawingBufferSize = function (target) {
			return target.set(_width * _pixelRatio, _height * _pixelRatio).floor();
		};

    this.setDrawingBufferSize = function (width, height, pixelRatio) {
			_width = width;
			_height = height;

			_pixelRatio = pixelRatio;

			canvas.width = Math.floor(width * pixelRatio);
			canvas.height = Math.floor(height * pixelRatio);

			this.setViewport(0, 0, width, height);
		};

    this.getCurrentViewport = function (target) {
			return target.copy(_currentViewport);
		};

    this.getViewport = function (target) {
			return target.copy(_viewport);
		};

    this.setViewport = function (x, y, width, height) {
			if(x.isVector4) {
				_viewport.set(x.x, x.y, x.z, x.w);
			} else {
				_viewport.set(x, y, width, height);
			}

			state.viewport(_currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).floor());
		};

    // Scissor
    this.getScissor = function (target) {
			return target.copy(_scissor);
		};

    this.setScissor = function (x, y, width, height) {
			if(x.isVector4) {
				_scissor.set(x.x, x.y, x.z, x.w);
			} else {
				_scissor.set(x, y, width, height);
			}

			state.scissor(_currentScissor.copy(_scissor).multiplyScalar(_pixelRatio).floor());
		};

		this.getScissorTest = function () {
			return _scissorTest;
		};

		this.setScissorTest = function (boolean) {
			state.setScissorTest(_scissorTest = boolean);
		};

		this.setOpaqueSort = function (method) {
			_opaqueSort = method;
		};

		this.setTransparentSort = function (method) {
			_transparentSort = method;
		};

    // TODO Clearing

    // Disposal
    this.dispose = function () {
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
			canvas.removeEventListener('webglcontextrestored', onContextRestore, false);
			canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
		};

    // Events
    function onContextLost(event) {
			event.preventDefault();

			console.log('SonettoJS.WebGLRenderer: Context Lost.');

			_isContextLost = true;
		}

		function onContextRestore(/* event */) {
			console.log('SonettoJS.WebGLRenderer: Context Restored.');

			_isContextLost = false;

			initGLContext();
		}

		function onContextCreationError(event) {
			console.error('SonettoJS.WebGLRenderer: A WebGL context could not be created. Reason: ', event.statusMessage);
		}

    // TODO Rendering

  }

  get coordinateSystem() {
    return WebGLCoordinateSystem;
  }
}

export { WebGLRenderer };