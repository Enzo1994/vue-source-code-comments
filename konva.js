(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Konva = factory());
  })(this, (function () { 'use strict';
  
    /*
     * Konva JavaScript Framework v8.3.1
     * http://konvajs.org/
     * Licensed under the MIT
     * Date: Thu Dec 09 2021
     *
     * Original work Copyright (C) 2011 - 2013 by Eric Rowell (KineticJS)
     * Modified work Copyright (C) 2014 - present by Anton Lavrenov (Konva)
     *
     * @license
     */
    var PI_OVER_180 = Math.PI / 180;
    /**
     * @namespace Konva
     */
    function detectBrowser() {
        return (typeof window !== 'undefined' &&
            // browser case
            ({}.toString.call(window) === '[object Window]' ||
                // electron case
                {}.toString.call(window) === '[object global]'));
    }
    const glob = typeof global !== 'undefined'
        ? global
        : typeof window !== 'undefined'
            ? window
            : typeof WorkerGlobalScope !== 'undefined'
                ? self
                : {};
    const Konva$2 = {
        _global: glob,
        version: '8.3.1',
        isBrowser: detectBrowser(),
        isUnminified: /param/.test(function (param) { }.toString()),
        dblClickWindow: 400,
        getAngle(angle) {
            return Konva$2.angleDeg ? angle * PI_OVER_180 : angle;
        },
        enableTrace: false,
        pointerEventsEnabled: true,
        /**
         * Should Konva automatically update canvas on any changes. Default is true.
         * @property autoDrawEnabled
         * @default true
         * @name autoDrawEnabled
         * @memberof Konva
         * @example
         * Konva.autoDrawEnabled = true;
         */
        autoDrawEnabled: true,
        /**
         * Should we enable hit detection while dragging? For performance reasons, by default it is false.
         * But on some rare cases you want to see hit graph and check intersections. Just set it to true.
         * @property hitOnDragEnabled
         * @default false
         * @name hitOnDragEnabled
         * @memberof Konva
         * @example
         * Konva.hitOnDragEnabled = true;
         */
        hitOnDragEnabled: false,
        /**
         * Should we capture touch events and bind them to the touchstart target? That is how it works on DOM elements.
         * The case: we touchstart on div1, then touchmove out of that element into another element div2.
         * DOM will continue trigger touchmove events on div1 (not div2). Because events are "captured" into initial target.
         * By default Konva do not do that and will trigger touchmove on another element, while pointer is moving.
         * @property capturePointerEventsEnabled
         * @default false
         * @name capturePointerEventsEnabled
         * @memberof Konva
         * @example
         * Konva.capturePointerEventsEnabled = true;
         */
        capturePointerEventsEnabled: false,
        _mouseListenClick: false,
        _touchListenClick: false,
        _pointerListenClick: false,
        _mouseInDblClickWindow: false,
        _touchInDblClickWindow: false,
        _pointerInDblClickWindow: false,
        _mouseDblClickPointerId: null,
        _touchDblClickPointerId: null,
        _pointerDblClickPointerId: null,
        /**
         * Global pixel ratio configuration. KonvaJS automatically detect pixel ratio of current device.
         * But you may override such property, if you want to use your value. Set this value before any components initializations.
         * @property pixelRatio
         * @default undefined
         * @name pixelRatio
         * @memberof Konva
         * @example
         * // before any Konva code:
         * Konva.pixelRatio = 1;
         */
        pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
        /**
         * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point,
         * only then start dragging. Default is 3px.
         * @property dragDistance
         * @default 0
         * @memberof Konva
         * @example
         * Konva.dragDistance = 10;
         */
        dragDistance: 3,
        /**
         * Use degree values for angle properties. You may set this property to false if you want to use radian values.
         * @property angleDeg
         * @default true
         * @memberof Konva
         * @example
         * node.rotation(45); // 45 degrees
         * Konva.angleDeg = false;
         * node.rotation(Math.PI / 2); // PI/2 radian
         */
        angleDeg: true,
        /**
         * Show different warnings about errors or wrong API usage
         * @property showWarnings
         * @default true
         * @memberof Konva
         * @example
         * Konva.showWarnings = false;
         */
        showWarnings: true,
        /**
         * Configure what mouse buttons can be used for drag and drop.
         * Default value is [0] - only left mouse button.
         * @property dragButtons
         * @default true
         * @memberof Konva
         * @example
         * // enable left and right mouse buttons
         * Konva.dragButtons = [0, 2];
         */
        dragButtons: [0, 1],
        /**
         * returns whether or not drag and drop is currently active
         * @method
         * @memberof Konva
         */
        isDragging() {
            return Konva$2['DD'].isDragging;
        },
        /**
         * returns whether or not a drag and drop operation is ready, but may
         *  not necessarily have started
         * @method
         * @memberof Konva
         */
        isDragReady() {
            return !!Konva$2['DD'].node;
        },
        // user agent
        document: glob.document,
        // insert Konva into global namespace (window)
        // it is required for npm packages
        _injectGlobal(Konva) {
            glob.Konva = Konva;
        },
    };
    const _registerNode = (NodeClass) => {
        Konva$2[NodeClass.prototype.getClassName()] = NodeClass;
    };
    Konva$2._injectGlobal(Konva$2);
  
    /*
     * Last updated November 2011
     * By Simon Sarris
     * www.simonsarris.com
     * sarris@acm.org
     *
     * Free to use and distribute at will
     * So long as you are nice to people, etc
     */
    /*
     * The usage of this class was inspired by some of the work done by a forked
     * project, KineticJS-Ext by Wappworks, which is based on Simon's Transform
     * class.  Modified by Eric Rowell
     */
    /**
     * Transform constructor.
     * In most of the cases you don't need to use it in your app. Because it is for internal usage in Konva core.
     * But there is a documentation for that class in case you still want
     * to make some manual calculations.
     * @constructor
     * @param {Array} [m] Optional six-element matrix
     * @memberof Konva
     */
    class Transform {
        constructor(m = [1, 0, 0, 1, 0, 0]) {
            this.dirty = false;
            this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
        }
        reset() {
            this.m[0] = 1;
            this.m[1] = 0;
            this.m[2] = 0;
            this.m[3] = 1;
            this.m[4] = 0;
            this.m[5] = 0;
        }
        /**
         * Copy Konva.Transform object
         * @method
         * @name Konva.Transform#copy
         * @returns {Konva.Transform}
         * @example
         * const tr = shape.getTransform().copy()
         */
        copy() {
            return new Transform(this.m);
        }
        copyInto(tr) {
            tr.m[0] = this.m[0];
            tr.m[1] = this.m[1];
            tr.m[2] = this.m[2];
            tr.m[3] = this.m[3];
            tr.m[4] = this.m[4];
            tr.m[5] = this.m[5];
        }
        /**
         * Transform point
         * @method
         * @name Konva.Transform#point
         * @param {Object} point 2D point(x, y)
         * @returns {Object} 2D point(x, y)
         */
        point(point) {
            var m = this.m;
            return {
                x: m[0] * point.x + m[2] * point.y + m[4],
                y: m[1] * point.x + m[3] * point.y + m[5],
            };
        }
        /**
         * Apply translation
         * @method
         * @name Konva.Transform#translate
         * @param {Number} x
         * @param {Number} y
         * @returns {Konva.Transform}
         */
        translate(x, y) {
            this.m[4] += this.m[0] * x + this.m[2] * y;
            this.m[5] += this.m[1] * x + this.m[3] * y;
            return this;
        }
        /**
         * Apply scale
         * @method
         * @name Konva.Transform#scale
         * @param {Number} sx
         * @param {Number} sy
         * @returns {Konva.Transform}
         */
        scale(sx, sy) {
            this.m[0] *= sx;
            this.m[1] *= sx;
            this.m[2] *= sy;
            this.m[3] *= sy;
            return this;
        }
        /**
         * Apply rotation
         * @method
         * @name Konva.Transform#rotate
         * @param {Number} rad  Angle in radians
         * @returns {Konva.Transform}
         */
        rotate(rad) {
            var c = Math.cos(rad);
            var s = Math.sin(rad);
            var m11 = this.m[0] * c + this.m[2] * s;
            var m12 = this.m[1] * c + this.m[3] * s;
            var m21 = this.m[0] * -s + this.m[2] * c;
            var m22 = this.m[1] * -s + this.m[3] * c;
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            return this;
        }
        /**
         * Returns the translation
         * @method
         * @name Konva.Transform#getTranslation
         * @returns {Object} 2D point(x, y)
         */
        getTranslation() {
            return {
                x: this.m[4],
                y: this.m[5],
            };
        }
        /**
         * Apply skew
         * @method
         * @name Konva.Transform#skew
         * @param {Number} sx
         * @param {Number} sy
         * @returns {Konva.Transform}
         */
        skew(sx, sy) {
            var m11 = this.m[0] + this.m[2] * sy;
            var m12 = this.m[1] + this.m[3] * sy;
            var m21 = this.m[2] + this.m[0] * sx;
            var m22 = this.m[3] + this.m[1] * sx;
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            return this;
        }
        /**
         * Transform multiplication
         * @method
         * @name Konva.Transform#multiply
         * @param {Konva.Transform} matrix
         * @returns {Konva.Transform}
         */
        multiply(matrix) {
            var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
            var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
            var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
            var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
            var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
            var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            this.m[4] = dx;
            this.m[5] = dy;
            return this;
        }
        /**
         * Invert the matrix
         * @method
         * @name Konva.Transform#invert
         * @returns {Konva.Transform}
         */
        invert() {
            var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
            var m0 = this.m[3] * d;
            var m1 = -this.m[1] * d;
            var m2 = -this.m[2] * d;
            var m3 = this.m[0] * d;
            var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
            var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
            this.m[0] = m0;
            this.m[1] = m1;
            this.m[2] = m2;
            this.m[3] = m3;
            this.m[4] = m4;
            this.m[5] = m5;
            return this;
        }
        /**
         * return matrix
         * @method
         * @name Konva.Transform#getMatrix
         */
        getMatrix() {
            return this.m;
        }
        /**
         * set to absolute position via translation
         * @method
         * @name Konva.Transform#setAbsolutePosition
         * @returns {Konva.Transform}
         * @author ericdrowell
         */
        setAbsolutePosition(x, y) {
            var m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3], m4 = this.m[4], m5 = this.m[5], yt = (m0 * (y - m5) - m1 * (x - m4)) / (m0 * m3 - m1 * m2), xt = (x - m4 - m2 * yt) / m0;
            return this.translate(xt, yt);
        }
        /**
         * convert transformation matrix back into node's attributes
         * @method
         * @name Konva.Transform#decompose
         * @returns {Konva.Transform}
         */
        decompose() {
            var a = this.m[0];
            var b = this.m[1];
            var c = this.m[2];
            var d = this.m[3];
            var e = this.m[4];
            var f = this.m[5];
            var delta = a * d - b * c;
            let result = {
                x: e,
                y: f,
                rotation: 0,
                scaleX: 0,
                scaleY: 0,
                skewX: 0,
                skewY: 0,
            };
            // Apply the QR-like decomposition.
            if (a != 0 || b != 0) {
                var r = Math.sqrt(a * a + b * b);
                result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
                result.scaleX = r;
                result.scaleY = delta / r;
                result.skewX = (a * c + b * d) / delta;
                result.skewY = 0;
            }
            else if (c != 0 || d != 0) {
                var s = Math.sqrt(c * c + d * d);
                result.rotation =
                    Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
                result.scaleX = delta / s;
                result.scaleY = s;
                result.skewX = 0;
                result.skewY = (a * c + b * d) / delta;
            }
            else ;
            result.rotation = Util._getRotation(result.rotation);
            return result;
        }
    }
    // CONSTANTS
    var OBJECT_ARRAY = '[object Array]', OBJECT_NUMBER = '[object Number]', OBJECT_STRING = '[object String]', OBJECT_BOOLEAN = '[object Boolean]', PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH$1 = '#', EMPTY_STRING$1 = '', ZERO = '0', KONVA_WARNING = 'Konva warning: ', KONVA_ERROR = 'Konva error: ', RGB_PAREN = 'rgb(', COLORS = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 132, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 255, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 203],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [119, 128, 144],
        slategrey: [119, 128, 144],
        snow: [255, 255, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        transparent: [255, 255, 255, 0],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 5],
    }, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
    const req = (typeof requestAnimationFrame !== 'undefined' && requestAnimationFrame) ||
        function (f) {
            setTimeout(f, 60);
        };
    /**
     * @namespace Util
     * @memberof Konva
     */
    const Util = {
        /*
         * cherry-picked utilities from underscore.js
         */
        _isElement(obj) {
            return !!(obj && obj.nodeType == 1);
        },
        _isFunction(obj) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        },
        _isPlainObject(obj) {
            return !!obj && obj.constructor === Object;
        },
        _isArray(obj) {
            return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
        },
        _isNumber(obj) {
            return (Object.prototype.toString.call(obj) === OBJECT_NUMBER &&
                !isNaN(obj) &&
                isFinite(obj));
        },
        _isString(obj) {
            return Object.prototype.toString.call(obj) === OBJECT_STRING;
        },
        _isBoolean(obj) {
            return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
        },
        // arrays are objects too
        isObject(val) {
            return val instanceof Object;
        },
        isValidSelector(selector) {
            if (typeof selector !== 'string') {
                return false;
            }
            var firstChar = selector[0];
            return (firstChar === '#' ||
                firstChar === '.' ||
                firstChar === firstChar.toUpperCase());
        },
        _sign(number) {
            if (number === 0) {
                // that is not what sign usually returns
                // but that is what we need
                return 1;
            }
            if (number > 0) {
                return 1;
            }
            else {
                return -1;
            }
        },
        requestAnimFrame(callback) {
            animQueue.push(callback);
            if (animQueue.length === 1) {
                req(function () {
                    const queue = animQueue;
                    animQueue = [];
                    queue.forEach(function (cb) {
                        cb();
                    });
                });
            }
        },
        createCanvasElement() {
            var canvas = document.createElement('canvas');
            // on some environments canvas.style is readonly
            try {
                canvas.style = canvas.style || {};
            }
            catch (e) { }
            return canvas;
        },
        createImageElement() {
            return document.createElement('img');
        },
        _isInDocument(el) {
            while ((el = el.parentNode)) {
                if (el == document) {
                    return true;
                }
            }
            return false;
        },
        /*
         * arg can be an image object or image data
         */
        _urlToImage(url, callback) {
            // if arg is a string, then it's a data url
            var imageObj = Util.createImageElement();
            imageObj.onload = function () {
                callback(imageObj);
            };
            imageObj.src = url;
        },
        _rgbToHex(r, g, b) {
            return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        _hexToRgb(hex) {
            hex = hex.replace(HASH$1, EMPTY_STRING$1);
            var bigint = parseInt(hex, 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255,
            };
        },
        /**
         * return random hex color
         * @method
         * @memberof Konva.Util
         * @example
         * shape.fill(Konva.Util.getRandomColor());
         */
        getRandomColor() {
            var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
            while (randColor.length < 6) {
                randColor = ZERO + randColor;
            }
            return HASH$1 + randColor;
        },
        /**
         * get RGB components of a color
         * @method
         * @memberof Konva.Util
         * @param {String} color
         * @example
         * // each of the following examples return {r:0, g:0, b:255}
         * var rgb = Konva.Util.getRGB('blue');
         * var rgb = Konva.Util.getRGB('#0000ff');
         * var rgb = Konva.Util.getRGB('rgb(0,0,255)');
         */
        getRGB(color) {
            var rgb;
            // color string
            if (color in COLORS) {
                rgb = COLORS[color];
                return {
                    r: rgb[0],
                    g: rgb[1],
                    b: rgb[2],
                };
            }
            else if (color[0] === HASH$1) {
                // hex
                return this._hexToRgb(color.substring(1));
            }
            else if (color.substr(0, 4) === RGB_PAREN) {
                // rgb string
                rgb = RGB_REGEX.exec(color.replace(/ /g, ''));
                return {
                    r: parseInt(rgb[1], 10),
                    g: parseInt(rgb[2], 10),
                    b: parseInt(rgb[3], 10),
                };
            }
            else {
                // default
                return {
                    r: 0,
                    g: 0,
                    b: 0,
                };
            }
        },
        // convert any color string to RGBA object
        // from https://github.com/component/color-parser
        colorToRGBA(str) {
            str = str || 'black';
            return (Util._namedColorToRBA(str) ||
                Util._hex3ColorToRGBA(str) ||
                Util._hex6ColorToRGBA(str) ||
                Util._rgbColorToRGBA(str) ||
                Util._rgbaColorToRGBA(str) ||
                Util._hslColorToRGBA(str));
        },
        // Parse named css color. Like "green"
        _namedColorToRBA(str) {
            var c = COLORS[str.toLowerCase()];
            if (!c) {
                return null;
            }
            return {
                r: c[0],
                g: c[1],
                b: c[2],
                a: 1,
            };
        },
        // Parse rgb(n, n, n)
        _rgbColorToRGBA(str) {
            if (str.indexOf('rgb(') === 0) {
                str = str.match(/rgb\(([^)]+)\)/)[1];
                var parts = str.split(/ *, */).map(Number);
                return {
                    r: parts[0],
                    g: parts[1],
                    b: parts[2],
                    a: 1,
                };
            }
        },
        // Parse rgba(n, n, n, n)
        _rgbaColorToRGBA(str) {
            if (str.indexOf('rgba(') === 0) {
                str = str.match(/rgba\(([^)]+)\)/)[1];
                var parts = str.split(/ *, */).map(Number);
                return {
                    r: parts[0],
                    g: parts[1],
                    b: parts[2],
                    a: parts[3],
                };
            }
        },
        // Parse #nnnnnn
        _hex6ColorToRGBA(str) {
            if (str[0] === '#' && str.length === 7) {
                return {
                    r: parseInt(str.slice(1, 3), 16),
                    g: parseInt(str.slice(3, 5), 16),
                    b: parseInt(str.slice(5, 7), 16),
                    a: 1,
                };
            }
        },
        // Parse #nnn
        _hex3ColorToRGBA(str) {
            if (str[0] === '#' && str.length === 4) {
                return {
                    r: parseInt(str[1] + str[1], 16),
                    g: parseInt(str[2] + str[2], 16),
                    b: parseInt(str[3] + str[3], 16),
                    a: 1,
                };
            }
        },
        // Code adapted from https://github.com/Qix-/color-convert/blob/master/conversions.js#L244
        _hslColorToRGBA(str) {
            // Check hsl() format
            if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
                // Extract h, s, l
                const [_, ...hsl] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str);
                const h = Number(hsl[0]) / 360;
                const s = Number(hsl[1]) / 100;
                const l = Number(hsl[2]) / 100;
                let t2;
                let t3;
                let val;
                if (s === 0) {
                    val = l * 255;
                    return {
                        r: Math.round(val),
                        g: Math.round(val),
                        b: Math.round(val),
                        a: 1,
                    };
                }
                if (l < 0.5) {
                    t2 = l * (1 + s);
                }
                else {
                    t2 = l + s - l * s;
                }
                const t1 = 2 * l - t2;
                const rgb = [0, 0, 0];
                for (let i = 0; i < 3; i++) {
                    t3 = h + (1 / 3) * -(i - 1);
                    if (t3 < 0) {
                        t3++;
                    }
                    if (t3 > 1) {
                        t3--;
                    }
                    if (6 * t3 < 1) {
                        val = t1 + (t2 - t1) * 6 * t3;
                    }
                    else if (2 * t3 < 1) {
                        val = t2;
                    }
                    else if (3 * t3 < 2) {
                        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                    }
                    else {
                        val = t1;
                    }
                    rgb[i] = val * 255;
                }
                return {
                    r: Math.round(rgb[0]),
                    g: Math.round(rgb[1]),
                    b: Math.round(rgb[2]),
                    a: 1,
                };
            }
        },
        /**
         * check intersection of two client rectangles
         * @method
         * @memberof Konva.Util
         * @param {Object} r1 - { x, y, width, height } client rectangle
         * @param {Object} r2 - { x, y, width, height } client rectangle
         * @example
         * const overlapping = Konva.Util.haveIntersection(shape1.getClientRect(), shape2.getClientRect());
         */
        haveIntersection(r1, r2) {
            return !(r2.x > r1.x + r1.width ||
                r2.x + r2.width < r1.x ||
                r2.y > r1.y + r1.height ||
                r2.y + r2.height < r1.y);
        },
        cloneObject(obj) {
            var retObj = {};
            for (var key in obj) {
                if (this._isPlainObject(obj[key])) {
                    retObj[key] = this.cloneObject(obj[key]);
                }
                else if (this._isArray(obj[key])) {
                    retObj[key] = this.cloneArray(obj[key]);
                }
                else {
                    retObj[key] = obj[key];
                }
            }
            return retObj;
        },
        cloneArray(arr) {
            return arr.slice(0);
        },
        degToRad(deg) {
            return deg * PI_OVER_DEG180;
        },
        radToDeg(rad) {
            return rad * DEG180_OVER_PI;
        },
        _degToRad(deg) {
            Util.warn('Util._degToRad is removed. Please use public Util.degToRad instead.');
            return Util.degToRad(deg);
        },
        _radToDeg(rad) {
            Util.warn('Util._radToDeg is removed. Please use public Util.radToDeg instead.');
            return Util.radToDeg(rad);
        },
        _getRotation(radians) {
            return Konva$2.angleDeg ? Util.radToDeg(radians) : radians;
        },
        _capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        throw(str) {
            throw new Error(KONVA_ERROR + str);
        },
        error(str) {
            console.error(KONVA_ERROR + str);
        },
        warn(str) {
            if (!Konva$2.showWarnings) {
                return;
            }
            console.warn(KONVA_WARNING + str);
        },
        each(obj, func) {
            for (var key in obj) {
                func(key, obj[key]);
            }
        },
        _inRange(val, left, right) {
            return left <= val && val < right;
        },
        _getProjectionToSegment(x1, y1, x2, y2, x3, y3) {
            var x, y, dist;
            var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
            if (pd2 == 0) {
                x = x1;
                y = y1;
                dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
            }
            else {
                var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
                if (u < 0) {
                    x = x1;
                    y = y1;
                    dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
                }
                else if (u > 1.0) {
                    x = x2;
                    y = y2;
                    dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
                }
                else {
                    x = x1 + u * (x2 - x1);
                    y = y1 + u * (y2 - y1);
                    dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
                }
            }
            return [x, y, dist];
        },
        // line as array of points.
        // line might be closed
        _getProjectionToLine(pt, line, isClosed) {
            var pc = Util.cloneObject(pt);
            var dist = Number.MAX_VALUE;
            line.forEach(function (p1, i) {
                if (!isClosed && i === line.length - 1) {
                    return;
                }
                var p2 = line[(i + 1) % line.length];
                var proj = Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
                var px = proj[0], py = proj[1], pdist = proj[2];
                if (pdist < dist) {
                    pc.x = px;
                    pc.y = py;
                    dist = pdist;
                }
            });
            return pc;
        },
        _prepareArrayForTween(startArray, endArray, isClosed) {
            var n, start = [], end = [];
            if (startArray.length > endArray.length) {
                var temp = endArray;
                endArray = startArray;
                startArray = temp;
            }
            for (n = 0; n < startArray.length; n += 2) {
                start.push({
                    x: startArray[n],
                    y: startArray[n + 1],
                });
            }
            for (n = 0; n < endArray.length; n += 2) {
                end.push({
                    x: endArray[n],
                    y: endArray[n + 1],
                });
            }
            var newStart = [];
            end.forEach(function (point) {
                var pr = Util._getProjectionToLine(point, start, isClosed);
                newStart.push(pr.x);
                newStart.push(pr.y);
            });
            return newStart;
        },
        _prepareToStringify(obj) {
            var desc;
            obj.visitedByCircularReferenceRemoval = true;
            for (var key in obj) {
                if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object')) {
                    continue;
                }
                desc = Object.getOwnPropertyDescriptor(obj, key);
                if (obj[key].visitedByCircularReferenceRemoval ||
                    Util._isElement(obj[key])) {
                    if (desc.configurable) {
                        delete obj[key];
                    }
                    else {
                        return null;
                    }
                }
                else if (Util._prepareToStringify(obj[key]) === null) {
                    if (desc.configurable) {
                        delete obj[key];
                    }
                    else {
                        return null;
                    }
                }
            }
            delete obj.visitedByCircularReferenceRemoval;
            return obj;
        },
        // very simplified version of Object.assign
        _assign(target, source) {
            for (var key in source) {
                target[key] = source[key];
            }
            return target;
        },
        _getFirstPointerId(evt) {
            if (!evt.touches) {
                // try to use pointer id or fake id
                return evt.pointerId || 999;
            }
            else {
                return evt.changedTouches[0].identifier;
            }
        },
    };
  
    function _formatValue(val) {
        if (Util._isString(val)) {
            return '"' + val + '"';
        }
        if (Object.prototype.toString.call(val) === '[object Number]') {
            return val;
        }
        if (Util._isBoolean(val)) {
            return val;
        }
        return Object.prototype.toString.call(val);
    }
    function RGBComponent(val) {
        if (val > 255) {
            return 255;
        }
        else if (val < 0) {
            return 0;
        }
        return Math.round(val);
    }
    function getNumberValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                if (!Util._isNumber(val)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a number.');
                }
                return val;
            };
        }
    }
    function getNumberOrArrayOfNumbersValidator(noOfElements) {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                let isNumber = Util._isNumber(val);
                let isValidArray = Util._isArray(val) && val.length == noOfElements;
                if (!isNumber && !isValidArray) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a number or Array<number>(' +
                        noOfElements +
                        ')');
                }
                return val;
            };
        }
    }
    function getNumberOrAutoValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                var isNumber = Util._isNumber(val);
                var isAuto = val === 'auto';
                if (!(isNumber || isAuto)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a number or "auto".');
                }
                return val;
            };
        }
    }
    function getStringValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                if (!Util._isString(val)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a string.');
                }
                return val;
            };
        }
    }
    function getStringOrGradientValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                const isString = Util._isString(val);
                const isGradient = Object.prototype.toString.call(val) === '[object CanvasGradient]' ||
                    (val && val.addColorStop);
                if (!(isString || isGradient)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a string or a native gradient.');
                }
                return val;
            };
        }
    }
    function getNumberArrayValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                if (!Util._isArray(val)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a array of numbers.');
                }
                else {
                    val.forEach(function (item) {
                        if (!Util._isNumber(item)) {
                            Util.warn('"' +
                                attr +
                                '" attribute has non numeric element ' +
                                item +
                                '. Make sure that all elements are numbers.');
                        }
                    });
                }
                return val;
            };
        }
    }
    function getBooleanValidator() {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                var isBool = val === true || val === false;
                if (!isBool) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be a boolean.');
                }
                return val;
            };
        }
    }
    function getComponentValidator(components) {
        if (Konva$2.isUnminified) {
            return function (val, attr) {
                if (!Util.isObject(val)) {
                    Util.warn(_formatValue(val) +
                        ' is a not valid value for "' +
                        attr +
                        '" attribute. The value should be an object with properties ' +
                        components);
                }
                return val;
            };
        }
    }
  
    var GET = 'get', SET$1 = 'set';
    const Factory = {
        addGetterSetter(constructor, attr, def, validator, after) {
            Factory.addGetter(constructor, attr, def);
            Factory.addSetter(constructor, attr, validator, after);
            Factory.addOverloadedGetterSetter(constructor, attr);
        },
        addGetter(constructor, attr, def) {
            var method = GET + Util._capitalize(attr);
            constructor.prototype[method] =
                constructor.prototype[method] ||
                    function () {
                        var val = this.attrs[attr];
                        return val === undefined ? def : val;
                    };
        },
        addSetter(constructor, attr, validator, after) {
            var method = SET$1 + Util._capitalize(attr);
            if (!constructor.prototype[method]) {
                Factory.overWriteSetter(constructor, attr, validator, after);
            }
        },
        overWriteSetter(constructor, attr, validator, after) {
            var method = SET$1 + Util._capitalize(attr);
            constructor.prototype[method] = function (val) {
                if (validator && val !== undefined && val !== null) {
                    val = validator.call(this, val, attr);
                }
                this._setAttr(attr, val);
                if (after) {
                    after.call(this);
                }
                return this;
            };
        },
        addComponentsGetterSetter(constructor, attr, components, validator, after) {
            var len = components.length, capitalize = Util._capitalize, getter = GET + capitalize(attr), setter = SET$1 + capitalize(attr), n, component;
            // getter
            constructor.prototype[getter] = function () {
                var ret = {};
                for (n = 0; n < len; n++) {
                    component = components[n];
                    ret[component] = this.getAttr(attr + capitalize(component));
                }
                return ret;
            };
            var basicValidator = getComponentValidator(components);
            // setter
            constructor.prototype[setter] = function (val) {
                var oldVal = this.attrs[attr], key;
                if (validator) {
                    val = validator.call(this, val);
                }
                if (basicValidator) {
                    basicValidator.call(this, val, attr);
                }
                for (key in val) {
                    if (!val.hasOwnProperty(key)) {
                        continue;
                    }
                    this._setAttr(attr + capitalize(key), val[key]);
                }
                this._fireChangeEvent(attr, oldVal, val);
                if (after) {
                    after.call(this);
                }
                return this;
            };
            Factory.addOverloadedGetterSetter(constructor, attr);
        },
        addOverloadedGetterSetter(constructor, attr) {
            var capitalizedAttr = Util._capitalize(attr), setter = SET$1 + capitalizedAttr, getter = GET + capitalizedAttr;
            constructor.prototype[attr] = function () {
                // setting
                if (arguments.length) {
                    this[setter](arguments[0]);
                    return this;
                }
                // getting
                return this[getter]();
            };
        },
        addDeprecatedGetterSetter(constructor, attr, def, validator) {
            Util.error('Adding deprecated ' + attr);
            var method = GET + Util._capitalize(attr);
            var message = attr +
                ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
            constructor.prototype[method] = function () {
                Util.error(message);
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
            Factory.addSetter(constructor, attr, validator, function () {
                Util.error(message);
            });
            Factory.addOverloadedGetterSetter(constructor, attr);
        },
        backCompat(constructor, methods) {
            Util.each(methods, function (oldMethodName, newMethodName) {
                var method = constructor.prototype[newMethodName];
                var oldGetter = GET + Util._capitalize(oldMethodName);
                var oldSetter = SET$1 + Util._capitalize(oldMethodName);
                function deprecated() {
                    method.apply(this, arguments);
                    Util.error('"' +
                        oldMethodName +
                        '" method is deprecated and will be removed soon. Use ""' +
                        newMethodName +
                        '" instead.');
                }
                constructor.prototype[oldMethodName] = deprecated;
                constructor.prototype[oldGetter] = deprecated;
                constructor.prototype[oldSetter] = deprecated;
            });
        },
        afterSetFilter() {
            this._filterUpToDate = false;
        },
    };
  
    function simplifyArray(arr) {
        var retArr = [], len = arr.length, util = Util, n, val;
        for (n = 0; n < len; n++) {
            val = arr[n];
            if (util._isNumber(val)) {
                val = Math.round(val * 1000) / 1000;
            }
            else if (!util._isString(val)) {
                val = val + '';
            }
            retArr.push(val);
        }
        return retArr;
    }
    var COMMA = ',', OPEN_PAREN = '(', CLOSE_PAREN = ')', OPEN_PAREN_BRACKET = '([', CLOSE_BRACKET_PAREN = '])', SEMICOLON = ';', DOUBLE_PAREN = '()', 
    // EMPTY_STRING = '',
    EQUALS = '=', 
    // SET = 'set',
    CONTEXT_METHODS = [
        'arc',
        'arcTo',
        'beginPath',
        'bezierCurveTo',
        'clearRect',
        'clip',
        'closePath',
        'createLinearGradient',
        'createPattern',
        'createRadialGradient',
        'drawImage',
        'ellipse',
        'fill',
        'fillText',
        'getImageData',
        'createImageData',
        'lineTo',
        'moveTo',
        'putImageData',
        'quadraticCurveTo',
        'rect',
        'restore',
        'rotate',
        'save',
        'scale',
        'setLineDash',
        'setTransform',
        'stroke',
        'strokeText',
        'transform',
        'translate',
    ];
    var CONTEXT_PROPERTIES = [
        'fillStyle',
        'strokeStyle',
        'shadowColor',
        'shadowBlur',
        'shadowOffsetX',
        'shadowOffsetY',
        'lineCap',
        'lineDashOffset',
        'lineJoin',
        'lineWidth',
        'miterLimit',
        'font',
        'textAlign',
        'textBaseline',
        'globalAlpha',
        'globalCompositeOperation',
        'imageSmoothingEnabled',
    ];
    const traceArrMax = 100;
    /**
     * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
     * With core Konva shapes you don't need to use this object. But you will use it if you want to create
     * a [custom shape](/docs/react/Custom_Shape.html) or a [custom hit regions](/docs/events/Custom_Hit_Region.html).
     * For full information about each 2d context API use [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
     * @constructor
     * @memberof Konva
     * @example
     * const rect = new Konva.Shape({
     *    fill: 'red',
     *    width: 100,
     *    height: 100,
     *    sceneFunc: (ctx, shape) => {
     *      // ctx - is context wrapper
     *      // shape - is instance of Konva.Shape, so it equals to "rect" variable
     *      ctx.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
     *
     *      // automatically fill shape from props and draw hit region
     *      ctx.fillStrokeShape(shape);
     *    }
     * })
     */
    class Context {
        constructor(canvas) {
            this.canvas = canvas;
            this._context = canvas._canvas.getContext('2d');
            if (Konva$2.enableTrace) {
                this.traceArr = [];
                this._enableTrace();
            }
        }
        /**
         * fill shape
         * @method
         * @name Konva.Context#fillShape
         * @param {Konva.Shape} shape
         */
        fillShape(shape) {
            if (shape.fillEnabled()) {
                this._fill(shape);
            }
        }
        _fill(shape) {
            // abstract
        }
        /**
         * stroke shape
         * @method
         * @name Konva.Context#strokeShape
         * @param {Konva.Shape} shape
         */
        strokeShape(shape) {
            if (shape.hasStroke()) {
                this._stroke(shape);
            }
        }
        _stroke(shape) {
            // abstract
        }
        /**
         * fill then stroke
         * @method
         * @name Konva.Context#fillStrokeShape
         * @param {Konva.Shape} shape
         */
        fillStrokeShape(shape) {
            if (shape.attrs.fillAfterStrokeEnabled) {
                this.strokeShape(shape);
                this.fillShape(shape);
            }
            else {
                this.fillShape(shape);
                this.strokeShape(shape);
            }
        }
        getTrace(relaxed, rounded) {
            var traceArr = this.traceArr, len = traceArr.length, str = '', n, trace, method, args;
            for (n = 0; n < len; n++) {
                trace = traceArr[n];
                method = trace.method;
                // methods
                if (method) {
                    args = trace.args;
                    str += method;
                    if (relaxed) {
                        str += DOUBLE_PAREN;
                    }
                    else {
                        if (Util._isArray(args[0])) {
                            str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
                        }
                        else {
                            if (rounded) {
                                args = args.map((a) => typeof a === 'number' ? Math.floor(a) : a);
                            }
                            str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                        }
                    }
                }
                else {
                    // properties
                    str += trace.property;
                    if (!relaxed) {
                        str += EQUALS + trace.val;
                    }
                }
                str += SEMICOLON;
            }
            return str;
        }
        clearTrace() {
            this.traceArr = [];
        }
        _trace(str) {
            var traceArr = this.traceArr, len;
            traceArr.push(str);
            len = traceArr.length;
            if (len >= traceArrMax) {
                traceArr.shift();
            }
        }
        /**
         * reset canvas context transform
         * @method
         * @name Konva.Context#reset
         */
        reset() {
            var pixelRatio = this.getCanvas().getPixelRatio();
            this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
        }
        /**
         * get canvas wrapper
         * @method
         * @name Konva.Context#getCanvas
         * @returns {Konva.Canvas}
         */
        getCanvas() {
            return this.canvas;
        }
        /**
         * clear canvas
         * @method
         * @name Konva.Context#clear
         * @param {Object} [bounds]
         * @param {Number} [bounds.x]
         * @param {Number} [bounds.y]
         * @param {Number} [bounds.width]
         * @param {Number} [bounds.height]
         */
        clear(bounds) {
            var canvas = this.getCanvas();
            if (bounds) {
                this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
            }
            else {
                this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
            }
        }
        _applyLineCap(shape) {
            var lineCap = shape.getLineCap();
            if (lineCap) {
                this.setAttr('lineCap', lineCap);
            }
        }
        _applyOpacity(shape) {
            var absOpacity = shape.getAbsoluteOpacity();
            if (absOpacity !== 1) {
                this.setAttr('globalAlpha', absOpacity);
            }
        }
        _applyLineJoin(shape) {
            var lineJoin = shape.attrs.lineJoin;
            if (lineJoin) {
                this.setAttr('lineJoin', lineJoin);
            }
        }
        setAttr(attr, val) {
            this._context[attr] = val;
        }
        /**
         * arc function.
         * @method
         * @name Konva.Context#arc
         */
        arc(a0, a1, a2, a3, a4, a5) {
            this._context.arc(a0, a1, a2, a3, a4, a5);
        }
        /**
         * arcTo function.
         * @method
         * @name Konva.Context#arcTo
         */
        arcTo(a0, a1, a2, a3, a4) {
            this._context.arcTo(a0, a1, a2, a3, a4);
        }
        /**
         * beginPath function.
         * @method
         * @name Konva.Context#beginPath
         */
        beginPath() {
            this._context.beginPath();
        }
        /**
         * bezierCurveTo function.
         * @method
         * @name Konva.Context#bezierCurveTo
         */
        bezierCurveTo(a0, a1, a2, a3, a4, a5) {
            this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
        }
        /**
         * clearRect function.
         * @method
         * @name Konva.Context#clearRect
         */
        clearRect(a0, a1, a2, a3) {
            this._context.clearRect(a0, a1, a2, a3);
        }
        /**
         * clip function.
         * @method
         * @name Konva.Context#clip
         */
        clip() {
            this._context.clip();
        }
        /**
         * closePath function.
         * @method
         * @name Konva.Context#closePath
         */
        closePath() {
            this._context.closePath();
        }
        /**
         * createImageData function.
         * @method
         * @name Konva.Context#createImageData
         */
        createImageData(a0, a1) {
            var a = arguments;
            if (a.length === 2) {
                return this._context.createImageData(a0, a1);
            }
            else if (a.length === 1) {
                return this._context.createImageData(a0);
            }
        }
        /**
         * createLinearGradient function.
         * @method
         * @name Konva.Context#createLinearGradient
         */
        createLinearGradient(a0, a1, a2, a3) {
            return this._context.createLinearGradient(a0, a1, a2, a3);
        }
        /**
         * createPattern function.
         * @method
         * @name Konva.Context#createPattern
         */
        createPattern(a0, a1) {
            return this._context.createPattern(a0, a1);
        }
        /**
         * createRadialGradient function.
         * @method
         * @name Konva.Context#createRadialGradient
         */
        createRadialGradient(a0, a1, a2, a3, a4, a5) {
            return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
        }
        /**
         * drawImage function.
         * @method
         * @name Konva.Context#drawImage
         */
        drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
            // this._context.drawImage(...arguments);
            var a = arguments, _context = this._context;
            if (a.length === 3) {
                _context.drawImage(a0, a1, a2);
            }
            else if (a.length === 5) {
                _context.drawImage(a0, a1, a2, a3, a4);
            }
            else if (a.length === 9) {
                _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
            }
        }
        /**
         * ellipse function.
         * @method
         * @name Konva.Context#ellipse
         */
        ellipse(a0, a1, a2, a3, a4, a5, a6, a7) {
            this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
        }
        /**
         * isPointInPath function.
         * @method
         * @name Konva.Context#isPointInPath
         */
        isPointInPath(x, y) {
            return this._context.isPointInPath(x, y);
        }
        /**
         * fill function.
         * @method
         * @name Konva.Context#fill
         */
        fill(path2d) {
            if (path2d) {
                this._context.fill(path2d);
            }
            else {
                this._context.fill();
            }
        }
        /**
         * fillRect function.
         * @method
         * @name Konva.Context#fillRect
         */
        fillRect(x, y, width, height) {
            this._context.fillRect(x, y, width, height);
        }
        /**
         * strokeRect function.
         * @method
         * @name Konva.Context#strokeRect
         */
        strokeRect(x, y, width, height) {
            this._context.strokeRect(x, y, width, height);
        }
        /**
         * fillText function.
         * @method
         * @name Konva.Context#fillText
         */
        fillText(text, x, y, maxWidth) {
            if (maxWidth) {
                this._context.fillText(text, x, y, maxWidth);
            }
            else {
                this._context.fillText(text, x, y);
            }
        }
        /**
         * measureText function.
         * @method
         * @name Konva.Context#measureText
         */
        measureText(text) {
            return this._context.measureText(text);
        }
        /**
         * getImageData function.
         * @method
         * @name Konva.Context#getImageData
         */
        getImageData(a0, a1, a2, a3) {
            return this._context.getImageData(a0, a1, a2, a3);
        }
        /**
         * lineTo function.
         * @method
         * @name Konva.Context#lineTo
         */
        lineTo(a0, a1) {
            this._context.lineTo(a0, a1);
        }
        /**
         * moveTo function.
         * @method
         * @name Konva.Context#moveTo
         */
        moveTo(a0, a1) {
            this._context.moveTo(a0, a1);
        }
        /**
         * rect function.
         * @method
         * @name Konva.Context#rect
         */
        rect(a0, a1, a2, a3) {
            this._context.rect(a0, a1, a2, a3);
        }
        /**
         * putImageData function.
         * @method
         * @name Konva.Context#putImageData
         */
        putImageData(a0, a1, a2) {
            this._context.putImageData(a0, a1, a2);
        }
        /**
         * quadraticCurveTo function.
         * @method
         * @name Konva.Context#quadraticCurveTo
         */
        quadraticCurveTo(a0, a1, a2, a3) {
            this._context.quadraticCurveTo(a0, a1, a2, a3);
        }
        /**
         * restore function.
         * @method
         * @name Konva.Context#restore
         */
        restore() {
            this._context.restore();
        }
        /**
         * rotate function.
         * @method
         * @name Konva.Context#rotate
         */
        rotate(a0) {
            this._context.rotate(a0);
        }
        /**
         * save function.
         * @method
         * @name Konva.Context#save
         */
        save() {
            this._context.save();
        }
        /**
         * scale function.
         * @method
         * @name Konva.Context#scale
         */
        scale(a0, a1) {
            this._context.scale(a0, a1);
        }
        /**
         * setLineDash function.
         * @method
         * @name Konva.Context#setLineDash
         */
        setLineDash(a0) {
            // works for Chrome and IE11
            if (this._context.setLineDash) {
                this._context.setLineDash(a0);
            }
            else if ('mozDash' in this._context) {
                // verified that this works in firefox
                this._context['mozDash'] = a0;
            }
            else if ('webkitLineDash' in this._context) {
                // does not currently work for Safari
                this._context['webkitLineDash'] = a0;
            }
            // no support for IE9 and IE10
        }
        /**
         * getLineDash function.
         * @method
         * @name Konva.Context#getLineDash
         */
        getLineDash() {
            return this._context.getLineDash();
        }
        /**
         * setTransform function.
         * @method
         * @name Konva.Context#setTransform
         */
        setTransform(a0, a1, a2, a3, a4, a5) {
            this._context.setTransform(a0, a1, a2, a3, a4, a5);
        }
        /**
         * stroke function.
         * @method
         * @name Konva.Context#stroke
         */
        stroke(path2d) {
            if (path2d) {
                this._context.stroke(path2d);
            }
            else {
                this._context.stroke();
            }
        }
        /**
         * strokeText function.
         * @method
         * @name Konva.Context#strokeText
         */
        strokeText(a0, a1, a2, a3) {
            this._context.strokeText(a0, a1, a2, a3);
        }
        /**
         * transform function.
         * @method
         * @name Konva.Context#transform
         */
        transform(a0, a1, a2, a3, a4, a5) {
            this._context.transform(a0, a1, a2, a3, a4, a5);
        }
        /**
         * translate function.
         * @method
         * @name Konva.Context#translate
         */
        translate(a0, a1) {
            this._context.translate(a0, a1);
        }
        _enableTrace() {
            var that = this, len = CONTEXT_METHODS.length, origSetter = this.setAttr, n, args;
            // to prevent creating scope function at each loop
            var func = function (methodName) {
                var origMethod = that[methodName], ret;
                that[methodName] = function () {
                    args = simplifyArray(Array.prototype.slice.call(arguments, 0));
                    ret = origMethod.apply(that, arguments);
                    that._trace({
                        method: methodName,
                        args: args,
                    });
                    return ret;
                };
            };
            // methods
            for (n = 0; n < len; n++) {
                func(CONTEXT_METHODS[n]);
            }
            // attrs
            that.setAttr = function () {
                origSetter.apply(that, arguments);
                var prop = arguments[0];
                var val = arguments[1];
                if (prop === 'shadowOffsetX' ||
                    prop === 'shadowOffsetY' ||
                    prop === 'shadowBlur') {
                    val = val / this.canvas.getPixelRatio();
                }
                that._trace({
                    property: prop,
                    val: val,
                });
            };
        }
        _applyGlobalCompositeOperation(node) {
            const op = node.attrs.globalCompositeOperation;
            var def = !op || op === 'source-over';
            if (!def) {
                this.setAttr('globalCompositeOperation', op);
            }
        }
    }
    CONTEXT_PROPERTIES.forEach(function (prop) {
        Object.defineProperty(Context.prototype, prop, {
            get() {
                return this._context[prop];
            },
            set(val) {
                this._context[prop] = val;
            },
        });
    });
    class SceneContext extends Context {
        _fillColor(shape) {
            var fill = shape.fill();
            this.setAttr('fillStyle', fill);
            shape._fillFunc(this);
        }
        _fillPattern(shape) {
            this.setAttr('fillStyle', shape._getFillPattern());
            shape._fillFunc(this);
        }
        _fillLinearGradient(shape) {
            var grd = shape._getLinearGradient();
            if (grd) {
                this.setAttr('fillStyle', grd);
                shape._fillFunc(this);
            }
        }
        _fillRadialGradient(shape) {
            var grd = shape._getRadialGradient();
            if (grd) {
                this.setAttr('fillStyle', grd);
                shape._fillFunc(this);
            }
        }
        _fill(shape) {
            var hasColor = shape.fill(), fillPriority = shape.getFillPriority();
            // priority fills
            if (hasColor && fillPriority === 'color') {
                this._fillColor(shape);
                return;
            }
            var hasPattern = shape.getFillPatternImage();
            if (hasPattern && fillPriority === 'pattern') {
                this._fillPattern(shape);
                return;
            }
            var hasLinearGradient = shape.getFillLinearGradientColorStops();
            if (hasLinearGradient && fillPriority === 'linear-gradient') {
                this._fillLinearGradient(shape);
                return;
            }
            var hasRadialGradient = shape.getFillRadialGradientColorStops();
            if (hasRadialGradient && fillPriority === 'radial-gradient') {
                this._fillRadialGradient(shape);
                return;
            }
            // now just try and fill with whatever is available
            if (hasColor) {
                this._fillColor(shape);
            }
            else if (hasPattern) {
                this._fillPattern(shape);
            }
            else if (hasLinearGradient) {
                this._fillLinearGradient(shape);
            }
            else if (hasRadialGradient) {
                this._fillRadialGradient(shape);
            }
        }
        _strokeLinearGradient(shape) {
            var start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
            if (colorStops) {
                // build color stops
                for (var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                this.setAttr('strokeStyle', grd);
            }
        }
        _stroke(shape) {
            var dash = shape.dash(), 
            // ignore strokeScaleEnabled for Text
            strokeScaleEnabled = shape.getStrokeScaleEnabled();
            if (shape.hasStroke()) {
                if (!strokeScaleEnabled) {
                    this.save();
                    var pixelRatio = this.getCanvas().getPixelRatio();
                    this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                }
                this._applyLineCap(shape);
                if (dash && shape.dashEnabled()) {
                    this.setLineDash(dash);
                    this.setAttr('lineDashOffset', shape.dashOffset());
                }
                this.setAttr('lineWidth', shape.strokeWidth());
                if (!shape.getShadowForStrokeEnabled()) {
                    this.setAttr('shadowColor', 'rgba(0,0,0,0)');
                }
                var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
                if (hasLinearGradient) {
                    this._strokeLinearGradient(shape);
                }
                else {
                    this.setAttr('strokeStyle', shape.stroke());
                }
                shape._strokeFunc(this);
                if (!strokeScaleEnabled) {
                    this.restore();
                }
            }
        }
        _applyShadow(shape) {
            var _a, _b, _c;
            var color = (_a = shape.getShadowRGBA()) !== null && _a !== void 0 ? _a : 'black', blur = (_b = shape.getShadowBlur()) !== null && _b !== void 0 ? _b : 5, offset = (_c = shape.getShadowOffset()) !== null && _c !== void 0 ? _c : {
                x: 0,
                y: 0,
            }, scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
            this.setAttr('shadowColor', color);
            this.setAttr('shadowBlur', blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
            this.setAttr('shadowOffsetX', offset.x * scaleX);
            this.setAttr('shadowOffsetY', offset.y * scaleY);
        }
    }
    class HitContext extends Context {
        _fill(shape) {
            this.save();
            this.setAttr('fillStyle', shape.colorKey);
            shape._fillFuncHit(this);
            this.restore();
        }
        strokeShape(shape) {
            if (shape.hasHitStroke()) {
                this._stroke(shape);
            }
        }
        _stroke(shape) {
            if (shape.hasHitStroke()) {
                // ignore strokeScaleEnabled for Text
                var strokeScaleEnabled = shape.getStrokeScaleEnabled();
                if (!strokeScaleEnabled) {
                    this.save();
                    var pixelRatio = this.getCanvas().getPixelRatio();
                    this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                }
                this._applyLineCap(shape);
                var hitStrokeWidth = shape.hitStrokeWidth();
                var strokeWidth = hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;
                this.setAttr('lineWidth', strokeWidth);
                this.setAttr('strokeStyle', shape.colorKey);
                shape._strokeFuncHit(this);
                if (!strokeScaleEnabled) {
                    this.restore();
                }
            }
        }
    }
  
    // calculate pixel ratio
    var _pixelRatio;
    function getDevicePixelRatio() {
        if (_pixelRatio) {
            return _pixelRatio;
        }
        var canvas = Util.createCanvasElement();
        var context = canvas.getContext('2d');
        _pixelRatio = (function () {
            var devicePixelRatio = Konva$2._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio ||
                1;
            return devicePixelRatio / backingStoreRatio;
        })();
        return _pixelRatio;
    }
    /**
     * Canvas Renderer constructor. It is a wrapper around native canvas element.
     * Usually you don't need to use it manually.
     * @constructor
     * @abstract
     * @memberof Konva
     * @param {Object} config
     * @param {Number} config.width
     * @param {Number} config.height
     * @param {Number} config.pixelRatio
     */
    class Canvas {
        constructor(config) {
            this.pixelRatio = 1;
            this.width = 0;
            this.height = 0;
            this.isCache = false;
            var conf = config || {};
            var pixelRatio = conf.pixelRatio || Konva$2.pixelRatio || getDevicePixelRatio();
            this.pixelRatio = pixelRatio;
            this._canvas = Util.createCanvasElement();
            // set inline styles
            this._canvas.style.padding = '0';
            this._canvas.style.margin = '0';
            this._canvas.style.border = '0';
            this._canvas.style.background = 'transparent';
            this._canvas.style.position = 'absolute';
            this._canvas.style.top = '0';
            this._canvas.style.left = '0';
        }
        /**
         * get canvas context
         * @method
         * @name Konva.Canvas#getContext
         * @returns {CanvasContext} context
         */
        getContext() {
            return this.context;
        }
        getPixelRatio() {
            return this.pixelRatio;
        }
        setPixelRatio(pixelRatio) {
            var previousRatio = this.pixelRatio;
            this.pixelRatio = pixelRatio;
            this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
        }
        setWidth(width) {
            // take into account pixel ratio
            this.width = this._canvas.width = width * this.pixelRatio;
            this._canvas.style.width = width + 'px';
            var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
            _context.scale(pixelRatio, pixelRatio);
        }
        setHeight(height) {
            // take into account pixel ratio
            this.height = this._canvas.height = height * this.pixelRatio;
            this._canvas.style.height = height + 'px';
            var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
            _context.scale(pixelRatio, pixelRatio);
        }
        getWidth() {
            return this.width;
        }
        getHeight() {
            return this.height;
        }
        setSize(width, height) {
            this.setWidth(width || 0);
            this.setHeight(height || 0);
        }
        /**
         * to data url
         * @method
         * @name Konva.Canvas#toDataURL
         * @param {String} mimeType
         * @param {Number} quality between 0 and 1 for jpg mime types
         * @returns {String} data url string
         */
        toDataURL(mimeType, quality) {
            try {
                // If this call fails (due to browser bug, like in Firefox 3.6),
                // then revert to previous no-parameter image/png behavior
                return this._canvas.toDataURL(mimeType, quality);
            }
            catch (e) {
                try {
                    return this._canvas.toDataURL();
                }
                catch (err) {
                    Util.error('Unable to get data URL. ' +
                        err.message +
                        ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                    return '';
                }
            }
        }
    }
    /**
     * get/set pixel ratio.
     * KonvaJS automatically handles pixel ratio adustments in order to render crisp drawings
     *  on all devices. Most desktops, low end tablets, and low end phones, have device pixel ratios
     *  of 1.  Some high end tablets and phones, like iPhones and iPads have a device pixel ratio
     *  of 2.  Some Macbook Pros, and iMacs also have a device pixel ratio of 2.  Some high end Android devices have pixel
     *  ratios of 2 or 3.  Some browsers like Firefox allow you to configure the pixel ratio of the viewport.  Unless otherwise
     *  specificed, the pixel ratio will be defaulted to the actual device pixel ratio.  You can override the device pixel
     *  ratio for special situations, or, if you don't want the pixel ratio to be taken into account, you can set it to 1.
     * @name Konva.Canvas#pixelRatio
     * @method
     * @param {Number} pixelRatio
     * @returns {Number}
     * @example
     * // get
     * var pixelRatio = layer.getCanvas.pixelRatio();
     *
     * // set
     * layer.getCanvas().pixelRatio(3);
     */
    Factory.addGetterSetter(Canvas, 'pixelRatio', undefined, getNumberValidator());
    class SceneCanvas extends Canvas {
        constructor(config = { width: 0, height: 0 }) {
            super(config);
            this.context = new SceneContext(this);
            this.setSize(config.width, config.height);
        }
    }
    class HitCanvas extends Canvas {
        constructor(config = { width: 0, height: 0 }) {
            super(config);
            this.hitCanvas = true;
            this.context = new HitContext(this);
            this.setSize(config.width, config.height);
        }
    }
  
    const DD = {
        get isDragging() {
            var flag = false;
            DD._dragElements.forEach((elem) => {
                if (elem.dragStatus === 'dragging') {
                    flag = true;
                }
            });
            return flag;
        },
        justDragged: false,
        get node() {
            // return first dragging node
            var node;
            DD._dragElements.forEach((elem) => {
                node = elem.node;
            });
            return node;
        },
        _dragElements: new Map(),
        // methods
        _drag(evt) {
            const nodesToFireEvents = [];
            DD._dragElements.forEach((elem, key) => {
                const { node } = elem;
                // we need to find pointer relative to that node
                const stage = node.getStage();
                stage.setPointersPositions(evt);
                // it is possible that user call startDrag without any event
                // it that case we need to detect first movable pointer and attach it into the node
                if (elem.pointerId === undefined) {
                    elem.pointerId = Util._getFirstPointerId(evt);
                }
                const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
                // not related pointer
                if (!pos) {
                    return;
                }
                if (elem.dragStatus !== 'dragging') {
                    var dragDistance = node.dragDistance();
                    var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                    if (distance < dragDistance) {
                        return;
                    }
                    node.startDrag({ evt });
                    // a user can stop dragging inside `dragstart`
                    if (!node.isDragging()) {
                        return;
                    }
                }
                node._setDragPosition(evt, elem);
                nodesToFireEvents.push(node);
            });
            // call dragmove only after ALL positions are changed
            nodesToFireEvents.forEach((node) => {
                node.fire('dragmove', {
                    type: 'dragmove',
                    target: node,
                    evt: evt,
                }, true);
            });
        },
        // dragBefore and dragAfter allows us to set correct order of events
        // setup all in dragbefore, and stop dragging only after pointerup triggered.
        _endDragBefore(evt) {
            DD._dragElements.forEach((elem) => {
                const { node } = elem;
                // we need to find pointer relative to that node
                const stage = node.getStage();
                if (evt) {
                    stage.setPointersPositions(evt);
                }
                const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
                // that pointer is not related
                if (!pos) {
                    return;
                }
                if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
                    // if a node is stopped manually we still need to reset events:
                    DD.justDragged = true;
                    Konva$2._mouseListenClick = false;
                    Konva$2._touchListenClick = false;
                    Konva$2._pointerListenClick = false;
                    elem.dragStatus = 'stopped';
                }
                const drawNode = elem.node.getLayer() ||
                    (elem.node instanceof Konva$2['Stage'] && elem.node);
                if (drawNode) {
                    drawNode.batchDraw();
                }
            });
        },
        _endDragAfter(evt) {
            DD._dragElements.forEach((elem, key) => {
                if (elem.dragStatus === 'stopped') {
                    elem.node.fire('dragend', {
                        type: 'dragend',
                        target: elem.node,
                        evt: evt,
                    }, true);
                }
                if (elem.dragStatus !== 'dragging') {
                    DD._dragElements.delete(key);
                }
            });
        },
    };
    if (Konva$2.isBrowser) {
        window.addEventListener('mouseup', DD._endDragBefore, true);
        window.addEventListener('touchend', DD._endDragBefore, true);
        window.addEventListener('mousemove', DD._drag);
        window.addEventListener('touchmove', DD._drag);
        window.addEventListener('mouseup', DD._endDragAfter, false);
        window.addEventListener('touchend', DD._endDragAfter, false);
    }
  
    // CONSTANTS
    var ABSOLUTE_OPACITY = 'absoluteOpacity', ALL_LISTENERS = 'allEventListeners', ABSOLUTE_TRANSFORM = 'absoluteTransform', ABSOLUTE_SCALE = 'absoluteScale', CANVAS = 'canvas', CHANGE = 'Change', CHILDREN = 'children', KONVA = 'konva', LISTENING = 'listening', MOUSEENTER$1 = 'mouseenter', MOUSELEAVE$1 = 'mouseleave', SET = 'set', SHAPE = 'Shape', SPACE$1 = ' ', STAGE$1 = 'stage', TRANSFORM = 'transform', UPPER_STAGE = 'Stage', VISIBLE = 'visible', TRANSFORM_CHANGE_STR$1 = [
        'xChange.konva',
        'yChange.konva',
        'scaleXChange.konva',
        'scaleYChange.konva',
        'skewXChange.konva',
        'skewYChange.konva',
        'rotationChange.konva',
        'offsetXChange.konva',
        'offsetYChange.konva',
        'transformsEnabledChange.konva',
    ].join(SPACE$1);
    let idCounter$1 = 1;
    /**
     * Node constructor. Nodes are entities that can be transformed, layered,
     * and have bound events. The stage, layers, groups, and shapes all extend Node.
     * @constructor
     * @memberof Konva
     * @param {Object} config
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     */
    class Node {
        constructor(config) {
            this._id = idCounter$1++;
            this.eventListeners = {};
            this.attrs = {};
            this.index = 0;
            this._allEventListeners = null;
            this.parent = null;
            this._cache = new Map();
            this._attachedDepsListeners = new Map();
            this._lastPos = null;
            this._batchingTransformChange = false;
            this._needClearTransformCache = false;
            this._filterUpToDate = false;
            this._isUnderCache = false;
            this._dragEventId = null;
            this._shouldFireChangeEvents = false;
            // on initial set attrs wi don't need to fire change events
            // because nobody is listening to them yet
            this.setAttrs(config);
            this._shouldFireChangeEvents = true;
            // all change event listeners are attached to the prototype
        }
        hasChildren() {
            return false;
        }
        _clearCache(attr) {
            // if we want to clear transform cache
            // we don't really need to remove it from the cache
            // but instead mark as "dirty"
            // so we don't need to create a new instance next time
            if ((attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM) &&
                this._cache.get(attr)) {
                this._cache.get(attr).dirty = true;
            }
            else if (attr) {
                this._cache.delete(attr);
            }
            else {
                this._cache.clear();
            }
        }
        _getCache(attr, privateGetter) {
            var cache = this._cache.get(attr);
            // for transform the cache can be NOT empty
            // but we still need to recalculate it if it is dirty
            var isTransform = attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM;
            var invalid = cache === undefined || (isTransform && cache.dirty === true);
            // if not cached, we need to set it using the private getter method.
            if (invalid) {
                cache = privateGetter.call(this);
                this._cache.set(attr, cache);
            }
            return cache;
        }
        _calculate(name, deps, getter) {
            // if we are trying to calculate function for the first time
            // we need to attach listeners for change events
            if (!this._attachedDepsListeners.get(name)) {
                const depsString = deps.map((dep) => dep + 'Change.konva').join(SPACE$1);
                this.on(depsString, () => {
                    this._clearCache(name);
                });
                this._attachedDepsListeners.set(name, true);
            }
            // just use cache function
            return this._getCache(name, getter);
        }
        _getCanvasCache() {
            return this._cache.get(CANVAS);
        }
        /*
         * when the logic for a cached result depends on ancestor propagation, use this
         * method to clear self and children cache
         */
        _clearSelfAndDescendantCache(attr) {
            this._clearCache(attr);
            // trigger clear cache, so transformer can use it
            if (attr === ABSOLUTE_TRANSFORM) {
                this.fire('absoluteTransformChange');
            }
        }
        /**
         * clear cached canvas
         * @method
         * @name Konva.Node#clearCache
         * @returns {Konva.Node}
         * @example
         * node.clearCache();
         */
        clearCache() {
            this._cache.delete(CANVAS);
            this._clearSelfAndDescendantCache();
            this._requestDraw();
            return this;
        }
        /**
         *  cache node to improve drawing performance, apply filters, or create more accurate
         *  hit regions. For all basic shapes size of cache canvas will be automatically detected.
         *  If you need to cache your custom `Konva.Shape` instance you have to pass shape's bounding box
         *  properties. Look at [https://konvajs.org/docs/performance/Shape_Caching.html](https://konvajs.org/docs/performance/Shape_Caching.html) for more information.
         * @method
         * @name Konva.Node#cache
         * @param {Object} [config]
         * @param {Number} [config.x]
         * @param {Number} [config.y]
         * @param {Number} [config.width]
         * @param {Number} [config.height]
         * @param {Number} [config.offset]  increase canvas size by `offset` pixel in all directions.
         * @param {Boolean} [config.drawBorder] when set to true, a red border will be drawn around the cached
         *  region for debugging purposes
         * @param {Number} [config.pixelRatio] change quality (or pixel ratio) of cached image. pixelRatio = 2 will produce 2x sized cache.
         * @param {Boolean} [config.imageSmoothingEnabled] control imageSmoothingEnabled property of created canvas for cache
         * @param {Number} [config.hitCanvasPixelRatio] change quality (or pixel ratio) of cached hit canvas.
         * @returns {Konva.Node}
         * @example
         * // cache a shape with the x,y position of the bounding box at the center and
         * // the width and height of the bounding box equal to the width and height of
         * // the shape obtained from shape.width() and shape.height()
         * image.cache();
         *
         * // cache a node and define the bounding box position and size
         * node.cache({
         *   x: -30,
         *   y: -30,
         *   width: 100,
         *   height: 200
         * });
         *
         * // cache a node and draw a red border around the bounding box
         * // for debugging purposes
         * node.cache({
         *   x: -30,
         *   y: -30,
         *   width: 100,
         *   height: 200,
         *   offset : 10,
         *   drawBorder: true
         * });
         */
        cache(config) {
            var conf = config || {};
            var rect = {};
            // don't call getClientRect if we have all attributes
            // it means call it only if have one undefined
            if (conf.x === undefined ||
                conf.y === undefined ||
                conf.width === undefined ||
                conf.height === undefined) {
                rect = this.getClientRect({
                    skipTransform: true,
                    relativeTo: this.getParent(),
                });
            }
            var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === undefined ? rect.x : conf.x, y = conf.y === undefined ? rect.y : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false, hitCanvasPixelRatio = conf.hitCanvasPixelRatio || 1;
            if (!width || !height) {
                Util.error('Can not cache the node. Width or height of the node equals 0. Caching is skipped.');
                return;
            }
            width += offset * 2;
            height += offset * 2;
            x -= offset;
            y -= offset;
            var cachedSceneCanvas = new SceneCanvas({
                pixelRatio: pixelRatio,
                width: width,
                height: height,
            }), cachedFilterCanvas = new SceneCanvas({
                pixelRatio: pixelRatio,
                width: 0,
                height: 0,
            }), cachedHitCanvas = new HitCanvas({
                pixelRatio: hitCanvasPixelRatio,
                width: width,
                height: height,
            }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
            cachedHitCanvas.isCache = true;
            cachedSceneCanvas.isCache = true;
            this._cache.delete(CANVAS);
            this._filterUpToDate = false;
            if (conf.imageSmoothingEnabled === false) {
                cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
                cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
            }
            sceneContext.save();
            hitContext.save();
            sceneContext.translate(-x, -y);
            hitContext.translate(-x, -y);
            // extra flag to skip on getAbsolute opacity calc
            this._isUnderCache = true;
            this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
            this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
            this.drawScene(cachedSceneCanvas, this);
            this.drawHit(cachedHitCanvas, this);
            this._isUnderCache = false;
            sceneContext.restore();
            hitContext.restore();
            // this will draw a red border around the cached box for
            // debugging purposes
            if (drawBorder) {
                sceneContext.save();
                sceneContext.beginPath();
                sceneContext.rect(0, 0, width, height);
                sceneContext.closePath();
                sceneContext.setAttr('strokeStyle', 'red');
                sceneContext.setAttr('lineWidth', 5);
                sceneContext.stroke();
                sceneContext.restore();
            }
            this._cache.set(CANVAS, {
                scene: cachedSceneCanvas,
                filter: cachedFilterCanvas,
                hit: cachedHitCanvas,
                x: x,
                y: y,
            });
            this._requestDraw();
            return this;
        }
        /**
         * determine if node is currently cached
         * @method
         * @name Konva.Node#isCached
         * @returns {Boolean}
         */
        isCached() {
            return this._cache.has(CANVAS);
        }
        /**
         * Return client rectangle {x, y, width, height} of node. This rectangle also include all styling (strokes, shadows, etc).
         * The purpose of the method is similar to getBoundingClientRect API of the DOM.
         * @method
         * @name Konva.Node#getClientRect
         * @param {Object} config
         * @param {Boolean} [config.skipTransform] should we apply transform to node for calculating rect?
         * @param {Boolean} [config.skipShadow] should we apply shadow to the node for calculating bound box?
         * @param {Boolean} [config.skipStroke] should we apply stroke to the node for calculating bound box?
         * @param {Object} [config.relativeTo] calculate client rect relative to one of the parents
         * @returns {Object} rect with {x, y, width, height} properties
         * @example
         * var rect = new Konva.Rect({
         *      width : 100,
         *      height : 100,
         *      x : 50,
         *      y : 50,
         *      strokeWidth : 4,
         *      stroke : 'black',
         *      offsetX : 50,
         *      scaleY : 2
         * });
         *
         * // get client rect without think off transformations (position, rotation, scale, offset, etc)
         * rect.getClientRect({ skipTransform: true});
         * // returns {
         * //     x : -2,   // two pixels for stroke / 2
         * //     y : -2,
         * //     width : 104, // increased by 4 for stroke
         * //     height : 104
         * //}
         *
         * // get client rect with transformation applied
         * rect.getClientRect();
         * // returns Object {x: -2, y: 46, width: 104, height: 208}
         */
        getClientRect(config) {
            // abstract method
            // redefine in Container and Shape
            throw new Error('abstract "getClientRect" method call');
        }
        _transformedRect(rect, top) {
            var points = [
                { x: rect.x, y: rect.y },
                { x: rect.x + rect.width, y: rect.y },
                { x: rect.x + rect.width, y: rect.y + rect.height },
                { x: rect.x, y: rect.y + rect.height },
            ];
            var minX, minY, maxX, maxY;
            var trans = this.getAbsoluteTransform(top);
            points.forEach(function (point) {
                var transformed = trans.point(point);
                if (minX === undefined) {
                    minX = maxX = transformed.x;
                    minY = maxY = transformed.y;
                }
                minX = Math.min(minX, transformed.x);
                minY = Math.min(minY, transformed.y);
                maxX = Math.max(maxX, transformed.x);
                maxY = Math.max(maxY, transformed.y);
            });
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            };
        }
        _drawCachedSceneCanvas(context) {
            context.save();
            context._applyOpacity(this);
            context._applyGlobalCompositeOperation(this);
            const canvasCache = this._getCanvasCache();
            context.translate(canvasCache.x, canvasCache.y);
            var cacheCanvas = this._getCachedSceneCanvas();
            var ratio = cacheCanvas.pixelRatio;
            context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
            context.restore();
        }
        _drawCachedHitCanvas(context) {
            var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
            context.save();
            context.translate(canvasCache.x, canvasCache.y);
            context.drawImage(hitCanvas._canvas, 0, 0, hitCanvas.width / hitCanvas.pixelRatio, hitCanvas.height / hitCanvas.pixelRatio);
            context.restore();
        }
        _getCachedSceneCanvas() {
            var filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter;
            if (filters) {
                if (!this._filterUpToDate) {
                    var ratio = sceneCanvas.pixelRatio;
                    filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
                    try {
                        len = filters.length;
                        filterContext.clear();
                        // copy cached canvas onto filter context
                        filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
                        imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
                        // apply filters to filter context
                        for (n = 0; n < len; n++) {
                            filter = filters[n];
                            if (typeof filter !== 'function') {
                                Util.error('Filter should be type of function, but got ' +
                                    typeof filter +
                                    ' instead. Please check correct filters');
                                continue;
                            }
                            filter.call(this, imageData);
                            filterContext.putImageData(imageData, 0, 0);
                        }
                    }
                    catch (e) {
                        Util.error('Unable to apply filter. ' +
                            e.message +
                            ' This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                    }
                    this._filterUpToDate = true;
                }
                return filterCanvas;
            }
            return sceneCanvas;
        }
        /**
         * bind events to the node. KonvaJS supports mouseover, mousemove,
         *  mouseout, mouseenter, mouseleave, mousedown, mouseup, wheel, contextmenu, click, dblclick, touchstart, touchmove,
         *  touchend, tap, dbltap, dragstart, dragmove, and dragend events.
         *  Pass in a string of events delimited by a space to bind multiple events at once
         *  such as 'mousedown mouseup mousemove'. Include a namespace to bind an
         *  event by name such as 'click.foobar'.
         * @method
         * @name Konva.Node#on
         * @param {String} evtStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo touchstart.foo'
         * @param {Function} handler The handler function. The first argument of that function is event object. Event object has `target` as main target of the event, `currentTarget` as current node listener and `evt` as native browser event.
         * @returns {Konva.Node}
         * @example
         * // add click listener
         * node.on('click', function() {
         *   console.log('you clicked me!');
         * });
         *
         * // get the target node
         * node.on('click', function(evt) {
         *   console.log(evt.target);
         * });
         *
         * // stop event propagation
         * node.on('click', function(evt) {
         *   evt.cancelBubble = true;
         * });
         *
         * // bind multiple listeners
         * node.on('click touchstart', function() {
         *   console.log('you clicked/touched me!');
         * });
         *
         * // namespace listener
         * node.on('click.foo', function() {
         *   console.log('you clicked/touched me!');
         * });
         *
         * // get the event type
         * node.on('click tap', function(evt) {
         *   var eventType = evt.type;
         * });
         *
         * // get native event object
         * node.on('click tap', function(evt) {
         *   var nativeEvent = evt.evt;
         * });
         *
         * // for change events, get the old and new val
         * node.on('xChange', function(evt) {
         *   var oldVal = evt.oldVal;
         *   var newVal = evt.newVal;
         * });
         *
         * // get event targets
         * // with event delegations
         * layer.on('click', 'Group', function(evt) {
         *   var shape = evt.target;
         *   var group = evt.currentTarget;
         * });
         */
        on(evtStr, handler) {
            this._cache && this._cache.delete(ALL_LISTENERS);
            if (arguments.length === 3) {
                return this._delegate.apply(this, arguments);
            }
            var events = evtStr.split(SPACE$1), len = events.length, n, event, parts, baseEvent, name;
            /*
             * loop through types and attach event listeners to
             * each one.  eg. 'click mouseover.namespace mouseout'
             * will create three event bindings
             */
            for (n = 0; n < len; n++) {
                event = events[n];
                parts = event.split('.');
                baseEvent = parts[0];
                name = parts[1] || '';
                // create events array if it doesn't exist
                if (!this.eventListeners[baseEvent]) {
                    this.eventListeners[baseEvent] = [];
                }
                this.eventListeners[baseEvent].push({
                    name: name,
                    handler: handler,
                });
            }
            return this;
        }
        /**
         * remove event bindings from the node. Pass in a string of
         *  event types delimmited by a space to remove multiple event
         *  bindings at once such as 'mousedown mouseup mousemove'.
         *  include a namespace to remove an event binding by name
         *  such as 'click.foobar'. If you only give a name like '.foobar',
         *  all events in that namespace will be removed.
         * @method
         * @name Konva.Node#off
         * @param {String} evtStr e.g. 'click', 'mousedown touchstart', '.foobar'
         * @returns {Konva.Node}
         * @example
         * // remove listener
         * node.off('click');
         *
         * // remove multiple listeners
         * node.off('click touchstart');
         *
         * // remove listener by name
         * node.off('click.foo');
         */
        off(evtStr, callback) {
            var events = (evtStr || '').split(SPACE$1), len = events.length, n, t, event, parts, baseEvent, name;
            this._cache && this._cache.delete(ALL_LISTENERS);
            if (!evtStr) {
                // remove all events
                for (t in this.eventListeners) {
                    this._off(t);
                }
            }
            for (n = 0; n < len; n++) {
                event = events[n];
                parts = event.split('.');
                baseEvent = parts[0];
                name = parts[1];
                if (baseEvent) {
                    if (this.eventListeners[baseEvent]) {
                        this._off(baseEvent, name, callback);
                    }
                }
                else {
                    for (t in this.eventListeners) {
                        this._off(t, name, callback);
                    }
                }
            }
            return this;
        }
        // some event aliases for third party integration like HammerJS
        dispatchEvent(evt) {
            var e = {
                target: this,
                type: evt.type,
                evt: evt,
            };
            this.fire(evt.type, e);
            return this;
        }
        addEventListener(type, handler) {
            // we have to pass native event to handler
            this.on(type, function (evt) {
                handler.call(this, evt.evt);
            });
            return this;
        }
        removeEventListener(type) {
            this.off(type);
            return this;
        }
        // like node.on
        _delegate(event, selector, handler) {
            var stopNode = this;
            this.on(event, function (evt) {
                var targets = evt.target.findAncestors(selector, true, stopNode);
                for (var i = 0; i < targets.length; i++) {
                    evt = Util.cloneObject(evt);
                    evt.currentTarget = targets[i];
                    handler.call(targets[i], evt);
                }
            });
        }
        /**
         * remove a node from parent, but don't destroy. You can reuse the node later.
         * @method
         * @name Konva.Node#remove
         * @returns {Konva.Node}
         * @example
         * node.remove();
         */
        remove() {
            if (this.isDragging()) {
                this.stopDrag();
            }
            // we can have drag element but that is not dragged yet
            // so just clear it
            DD._dragElements.delete(this._id);
            this._remove();
            return this;
        }
        _clearCaches() {
            this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
            this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
            this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
            this._clearSelfAndDescendantCache(STAGE$1);
            this._clearSelfAndDescendantCache(VISIBLE);
            this._clearSelfAndDescendantCache(LISTENING);
        }
        _remove() {
            // every cached attr that is calculated via node tree
            // traversal must be cleared when removing a node
            this._clearCaches();
            var parent = this.getParent();
            if (parent && parent.children) {
                parent.children.splice(this.index, 1);
                parent._setChildrenIndices();
                this.parent = null;
            }
        }
        /**
         * remove and destroy a node. Kill it and delete forever! You should not reuse node after destroy().
         * If the node is a container (Group, Stage or Layer) it will destroy all children too.
         * @method
         * @name Konva.Node#destroy
         * @example
         * node.destroy();
         */
        destroy() {
            this.remove();
            return this;
        }
        /**
         * get attr
         * @method
         * @name Konva.Node#getAttr
         * @param {String} attr
         * @returns {Integer|String|Object|Array}
         * @example
         * var x = node.getAttr('x');
         */
        getAttr(attr) {
            var method = 'get' + Util._capitalize(attr);
            if (Util._isFunction(this[method])) {
                return this[method]();
            }
            // otherwise get directly
            return this.attrs[attr];
        }
        /**
         * get ancestors
         * @method
         * @name Konva.Node#getAncestors
         * @returns {Array}
         * @example
         * shape.getAncestors().forEach(function(node) {
         *   console.log(node.getId());
         * })
         */
        getAncestors() {
            var parent = this.getParent(), ancestors = [];
            while (parent) {
                ancestors.push(parent);
                parent = parent.getParent();
            }
            return ancestors;
        }
        /**
         * get attrs object literal
         * @method
         * @name Konva.Node#getAttrs
         * @returns {Object}
         */
        getAttrs() {
            return this.attrs || {};
        }
        /**
         * set multiple attrs at once using an object literal
         * @method
         * @name Konva.Node#setAttrs
         * @param {Object} config object containing key value pairs
         * @returns {Konva.Node}
         * @example
         * node.setAttrs({
         *   x: 5,
         *   fill: 'red'
         * });
         */
        setAttrs(config) {
            this._batchTransformChanges(() => {
                var key, method;
                if (!config) {
                    return this;
                }
                for (key in config) {
                    if (key === CHILDREN) {
                        continue;
                    }
                    method = SET + Util._capitalize(key);
                    // use setter if available
                    if (Util._isFunction(this[method])) {
                        this[method](config[key]);
                    }
                    else {
                        // otherwise set directly
                        this._setAttr(key, config[key]);
                    }
                }
            });
            return this;
        }
        /**
         * determine if node is listening for events by taking into account ancestors.
         *
         * Parent    | Self      | isListening
         * listening | listening |
         * ----------+-----------+------------
         * T         | T         | T
         * T         | F         | F
         * F         | T         | F
         * F         | F         | F
         *
         * @method
         * @name Konva.Node#isListening
         * @returns {Boolean}
         */
        isListening() {
            return this._getCache(LISTENING, this._isListening);
        }
        _isListening(relativeTo) {
            const listening = this.listening();
            if (!listening) {
                return false;
            }
            const parent = this.getParent();
            if (parent && parent !== relativeTo && this !== relativeTo) {
                return parent._isListening(relativeTo);
            }
            else {
                return true;
            }
        }
        /**
         * determine if node is visible by taking into account ancestors.
         *
         * Parent    | Self      | isVisible
         * visible   | visible   |
         * ----------+-----------+------------
         * T         | T         | T
         * T         | F         | F
         * F         | T         | F
         * F         | F         | F
         * @method
         * @name Konva.Node#isVisible
         * @returns {Boolean}
         */
        isVisible() {
            return this._getCache(VISIBLE, this._isVisible);
        }
        _isVisible(relativeTo) {
            const visible = this.visible();
            if (!visible) {
                return false;
            }
            const parent = this.getParent();
            if (parent && parent !== relativeTo && this !== relativeTo) {
                return parent._isVisible(relativeTo);
            }
            else {
                return true;
            }
        }
        shouldDrawHit(top, skipDragCheck = false) {
            if (top) {
                return this._isVisible(top) && this._isListening(top);
            }
            var layer = this.getLayer();
            var layerUnderDrag = false;
            DD._dragElements.forEach((elem) => {
                if (elem.dragStatus !== 'dragging') {
                    return;
                }
                else if (elem.node.nodeType === 'Stage') {
                    layerUnderDrag = true;
                }
                else if (elem.node.getLayer() === layer) {
                    layerUnderDrag = true;
                }
            });
            var dragSkip = !skipDragCheck && !Konva$2.hitOnDragEnabled && layerUnderDrag;
            return this.isListening() && this.isVisible() && !dragSkip;
        }
        /**
         * show node. set visible = true
         * @method
         * @name Konva.Node#show
         * @returns {Konva.Node}
         */
        show() {
            this.visible(true);
            return this;
        }
        /**
         * hide node.  Hidden nodes are no longer detectable
         * @method
         * @name Konva.Node#hide
         * @returns {Konva.Node}
         */
        hide() {
            this.visible(false);
            return this;
        }
        getZIndex() {
            return this.index || 0;
        }
        /**
         * get absolute z-index which takes into account sibling
         *  and ancestor indices
         * @method
         * @name Konva.Node#getAbsoluteZIndex
         * @returns {Integer}
         */
        getAbsoluteZIndex() {
            var depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
            function addChildren(children) {
                nodes = [];
                len = children.length;
                for (n = 0; n < len; n++) {
                    child = children[n];
                    index++;
                    if (child.nodeType !== SHAPE) {
                        nodes = nodes.concat(child.getChildren().slice());
                    }
                    if (child._id === that._id) {
                        n = len;
                    }
                }
                if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
                    addChildren(nodes);
                }
            }
            if (that.nodeType !== UPPER_STAGE) {
                addChildren(that.getStage().getChildren());
            }
            return index;
        }
        /**
         * get node depth in node tree.  Returns an integer.
         *  e.g. Stage depth will always be 0.  Layers will always be 1.  Groups and Shapes will always
         *  be >= 2
         * @method
         * @name Konva.Node#getDepth
         * @returns {Integer}
         */
        getDepth() {
            var depth = 0, parent = this.parent;
            while (parent) {
                depth++;
                parent = parent.parent;
            }
            return depth;
        }
        // sometimes we do several attributes changes
        // like node.position(pos)
        // for performance reasons, lets batch transform reset
        // so it work faster
        _batchTransformChanges(func) {
            this._batchingTransformChange = true;
            func();
            this._batchingTransformChange = false;
            if (this._needClearTransformCache) {
                this._clearCache(TRANSFORM);
                this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
            }
            this._needClearTransformCache = false;
        }
        setPosition(pos) {
            this._batchTransformChanges(() => {
                this.x(pos.x);
                this.y(pos.y);
            });
            return this;
        }
        getPosition() {
            return {
                x: this.x(),
                y: this.y(),
            };
        }
        /**
         * get position of first pointer (like mouse or first touch) relative to local coordinates of current node
         * @method
         * @name Konva.Node#getRelativePointerPosition
         * @returns {Konva.Node}
         * @example
         *
         * // let's think we have a rectangle at position x = 10, y = 10
         * // now we clicked at x = 15, y = 15 of the stage
         * // if you want to know position of the click, related to the rectangle you can use
         * rect.getRelativePointerPosition();
         */
        getRelativePointerPosition() {
            if (!this.getStage()) {
                return null;
            }
            // get pointer (say mouse or touch) position
            var pos = this.getStage().getPointerPosition();
            if (!pos) {
                return null;
            }
            var transform = this.getAbsoluteTransform().copy();
            // to detect relative position we need to invert transform
            transform.invert();
            // now we can find relative point
            return transform.point(pos);
        }
        /**
         * get absolute position of a node. That function can be used to calculate absolute position, but relative to any ancestor
         * @method
         * @name Konva.Node#getAbsolutePosition
         * @param {Object} Ancestor optional ancestor node
         * @returns {Konva.Node}
         * @example
         *
         * // returns absolute position relative to top-left corner of canvas
         * node.getAbsolutePosition();
         *
         * // calculate absolute position of node, inside stage
         * // so stage transforms are ignored
         * node.getAbsolutePosition(stage)
         */
        getAbsolutePosition(top) {
            let haveCachedParent = false;
            let parent = this.parent;
            while (parent) {
                if (parent.isCached()) {
                    haveCachedParent = true;
                    break;
                }
                parent = parent.parent;
            }
            if (haveCachedParent && !top) {
                // make fake top element
                // "true" is not a node, but it will just allow skip all caching
                top = true;
            }
            var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Transform(), offset = this.offset();
            // clone the matrix array
            absoluteTransform.m = absoluteMatrix.slice();
            absoluteTransform.translate(offset.x, offset.y);
            return absoluteTransform.getTranslation();
        }
        setAbsolutePosition(pos) {
            var origTrans = this._clearTransform();
            // don't clear translation
            this.attrs.x = origTrans.x;
            this.attrs.y = origTrans.y;
            delete origTrans.x;
            delete origTrans.y;
            // important, use non cached value
            this._clearCache(TRANSFORM);
            var it = this._getAbsoluteTransform().copy();
            it.invert();
            it.translate(pos.x, pos.y);
            pos = {
                x: this.attrs.x + it.getTranslation().x,
                y: this.attrs.y + it.getTranslation().y,
            };
            this._setTransform(origTrans);
            this.setPosition({ x: pos.x, y: pos.y });
            this._clearCache(TRANSFORM);
            this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
            return this;
        }
        _setTransform(trans) {
            var key;
            for (key in trans) {
                this.attrs[key] = trans[key];
            }
            // this._clearCache(TRANSFORM);
            // this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
        }
        _clearTransform() {
            var trans = {
                x: this.x(),
                y: this.y(),
                rotation: this.rotation(),
                scaleX: this.scaleX(),
                scaleY: this.scaleY(),
                offsetX: this.offsetX(),
                offsetY: this.offsetY(),
                skewX: this.skewX(),
                skewY: this.skewY(),
            };
            this.attrs.x = 0;
            this.attrs.y = 0;
            this.attrs.rotation = 0;
            this.attrs.scaleX = 1;
            this.attrs.scaleY = 1;
            this.attrs.offsetX = 0;
            this.attrs.offsetY = 0;
            this.attrs.skewX = 0;
            this.attrs.skewY = 0;
            // return original transform
            return trans;
        }
        /**
         * move node by an amount relative to its current position
         * @method
         * @name Konva.Node#move
         * @param {Object} change
         * @param {Number} change.x
         * @param {Number} change.y
         * @returns {Konva.Node}
         * @example
         * // move node in x direction by 1px and y direction by 2px
         * node.move({
         *   x: 1,
         *   y: 2
         * });
         */
        move(change) {
            var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
            if (changeX !== undefined) {
                x += changeX;
            }
            if (changeY !== undefined) {
                y += changeY;
            }
            this.setPosition({ x: x, y: y });
            return this;
        }
        _eachAncestorReverse(func, top) {
            var family = [], parent = this.getParent(), len, n;
            // if top node is defined, and this node is top node,
            // there's no need to build a family tree.  just execute
            // func with this because it will be the only node
            if (top && top._id === this._id) {
                // func(this);
                return;
            }
            family.unshift(this);
            while (parent && (!top || parent._id !== top._id)) {
                family.unshift(parent);
                parent = parent.parent;
            }
            len = family.length;
            for (n = 0; n < len; n++) {
                func(family[n]);
            }
        }
        /**
         * rotate node by an amount in degrees relative to its current rotation
         * @method
         * @name Konva.Node#rotate
         * @param {Number} theta
         * @returns {Konva.Node}
         */
        rotate(theta) {
            this.rotation(this.rotation() + theta);
            return this;
        }
        /**
         * move node to the top of its siblings
         * @method
         * @name Konva.Node#moveToTop
         * @returns {Boolean}
         */
        moveToTop() {
            if (!this.parent) {
                Util.warn('Node has no parent. moveToTop function is ignored.');
                return false;
            }
            var index = this.index, len = this.parent.getChildren().length;
            if (index < len - 1) {
                this.parent.children.splice(index, 1);
                this.parent.children.push(this);
                this.parent._setChildrenIndices();
                return true;
            }
            return false;
        }
        /**
         * move node up
         * @method
         * @name Konva.Node#moveUp
         * @returns {Boolean} flag is moved or not
         */
        moveUp() {
            if (!this.parent) {
                Util.warn('Node has no parent. moveUp function is ignored.');
                return false;
            }
            var index = this.index, len = this.parent.getChildren().length;
            if (index < len - 1) {
                this.parent.children.splice(index, 1);
                this.parent.children.splice(index + 1, 0, this);
                this.parent._setChildrenIndices();
                return true;
            }
            return false;
        }
        /**
         * move node down
         * @method
         * @name Konva.Node#moveDown
         * @returns {Boolean}
         */
        moveDown() {
            if (!this.parent) {
                Util.warn('Node has no parent. moveDown function is ignored.');
                return false;
            }
            var index = this.index;
            if (index > 0) {
                this.parent.children.splice(index, 1);
                this.parent.children.splice(index - 1, 0, this);
                this.parent._setChildrenIndices();
                return true;
            }
            return false;
        }
        /**
         * move node to the bottom of its siblings
         * @method
         * @name Konva.Node#moveToBottom
         * @returns {Boolean}
         */
        moveToBottom() {
            if (!this.parent) {
                Util.warn('Node has no parent. moveToBottom function is ignored.');
                return false;
            }
            var index = this.index;
            if (index > 0) {
                this.parent.children.splice(index, 1);
                this.parent.children.unshift(this);
                this.parent._setChildrenIndices();
                return true;
            }
            return false;
        }
        setZIndex(zIndex) {
            if (!this.parent) {
                Util.warn('Node has no parent. zIndex parameter is ignored.');
                return this;
            }
            if (zIndex < 0 || zIndex >= this.parent.children.length) {
                Util.warn('Unexpected value ' +
                    zIndex +
                    ' for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to ' +
                    (this.parent.children.length - 1) +
                    '.');
            }
            var index = this.index;
            this.parent.children.splice(index, 1);
            this.parent.children.splice(zIndex, 0, this);
            this.parent._setChildrenIndices();
            return this;
        }
        /**
         * get absolute opacity
         * @method
         * @name Konva.Node#getAbsoluteOpacity
         * @returns {Number}
         */
        getAbsoluteOpacity() {
            return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
        }
        _getAbsoluteOpacity() {
            var absOpacity = this.opacity();
            var parent = this.getParent();
            if (parent && !parent._isUnderCache) {
                absOpacity *= parent.getAbsoluteOpacity();
            }
            return absOpacity;
        }
        /**
         * move node to another container
         * @method
         * @name Konva.Node#moveTo
         * @param {Container} newContainer
         * @returns {Konva.Node}
         * @example
         * // move node from current layer into layer2
         * node.moveTo(layer2);
         */
        moveTo(newContainer) {
            // do nothing if new container is already parent
            if (this.getParent() !== newContainer) {
                this._remove();
                newContainer.add(this);
            }
            return this;
        }
        /**
         * convert Node into an object for serialization.  Returns an object.
         * @method
         * @name Konva.Node#toObject
         * @returns {Object}
         */
        toObject() {
            var obj = {}, attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
            obj.attrs = {};
            for (key in attrs) {
                val = attrs[key];
                // if value is object and object is not plain
                // like class instance, we should skip it and to not include
                nonPlainObject =
                    Util.isObject(val) && !Util._isPlainObject(val) && !Util._isArray(val);
                if (nonPlainObject) {
                    continue;
                }
                getter = typeof this[key] === 'function' && this[key];
                // remove attr value so that we can extract the default value from the getter
                delete attrs[key];
                defaultValue = getter ? getter.call(this) : null;
                // restore attr value
                attrs[key] = val;
                if (defaultValue !== val) {
                    obj.attrs[key] = val;
                }
            }
            obj.className = this.getClassName();
            return Util._prepareToStringify(obj);
        }
        /**
         * convert Node into a JSON string.  Returns a JSON string.
         * @method
         * @name Konva.Node#toJSON
         * @returns {String}
         */
        toJSON() {
            return JSON.stringify(this.toObject());
        }
        /**
         * get parent container
         * @method
         * @name Konva.Node#getParent
         * @returns {Konva.Node}
         */
        getParent() {
            return this.parent;
        }
        /**
         * get all ancestors (parent then parent of the parent, etc) of the node
         * @method
         * @name Konva.Node#findAncestors
         * @param {String} selector selector for search
         * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
         * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
         * @returns {Array} [ancestors]
         * @example
         * // get one of the parent group
         * var parentGroups = node.findAncestors('Group');
         */
        findAncestors(selector, includeSelf, stopNode) {
            var res = [];
            if (includeSelf && this._isMatch(selector)) {
                res.push(this);
            }
            var ancestor = this.parent;
            while (ancestor) {
                if (ancestor === stopNode) {
                    return res;
                }
                if (ancestor._isMatch(selector)) {
                    res.push(ancestor);
                }
                ancestor = ancestor.parent;
            }
            return res;
        }
        isAncestorOf(node) {
            return false;
        }
        /**
         * get ancestor (parent or parent of the parent, etc) of the node that match passed selector
         * @method
         * @name Konva.Node#findAncestor
         * @param {String} selector selector for search
         * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
         * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
         * @returns {Konva.Node} ancestor
         * @example
         * // get one of the parent group
         * var group = node.findAncestors('.mygroup');
         */
        findAncestor(selector, includeSelf, stopNode) {
            return this.findAncestors(selector, includeSelf, stopNode)[0];
        }
        // is current node match passed selector?
        _isMatch(selector) {
            if (!selector) {
                return false;
            }
            if (typeof selector === 'function') {
                return selector(this);
            }
            var selectorArr = selector.replace(/ /g, '').split(','), len = selectorArr.length, n, sel;
            for (n = 0; n < len; n++) {
                sel = selectorArr[n];
                if (!Util.isValidSelector(sel)) {
                    Util.warn('Selector "' +
                        sel +
                        '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
                    Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
                    Util.warn('Konva is awesome, right?');
                }
                // id selector
                if (sel.charAt(0) === '#') {
                    if (this.id() === sel.slice(1)) {
                        return true;
                    }
                }
                else if (sel.charAt(0) === '.') {
                    // name selector
                    if (this.hasName(sel.slice(1))) {
                        return true;
                    }
                }
                else if (this.className === sel || this.nodeType === sel) {
                    return true;
                }
            }
            return false;
        }
        /**
         * get layer ancestor
         * @method
         * @name Konva.Node#getLayer
         * @returns {Konva.Layer}
         */
        getLayer() {
            var parent = this.getParent();
            return parent ? parent.getLayer() : null;
        }
        /**
         * get stage ancestor
         * @method
         * @name Konva.Node#getStage
         * @returns {Konva.Stage}
         */
        getStage() {
            return this._getCache(STAGE$1, this._getStage);
        }
        _getStage() {
            var parent = this.getParent();
            if (parent) {
                return parent.getStage();
            }
            else {
                return undefined;
            }
        }
        /**
         * fire event
         * @method
         * @name Konva.Node#fire
         * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
         * @param {Event} [evt] event object
         * @param {Boolean} [bubble] setting the value to false, or leaving it undefined, will result in the event
         *  not bubbling.  Setting the value to true will result in the event bubbling.
         * @returns {Konva.Node}
         * @example
         * // manually fire click event
         * node.fire('click');
         *
         * // fire custom event
         * node.fire('foo');
         *
         * // fire custom event with custom event object
         * node.fire('foo', {
         *   bar: 10
         * });
         *
         * // fire click event that bubbles
         * node.fire('click', null, true);
         */
        fire(eventType, evt = {}, bubble) {
            evt.target = evt.target || this;
            // bubble
            if (bubble) {
                this._fireAndBubble(eventType, evt);
            }
            else {
                // no bubble
                this._fire(eventType, evt);
            }
            return this;
        }
        /**
         * get absolute transform of the node which takes into
         *  account its ancestor transforms
         * @method
         * @name Konva.Node#getAbsoluteTransform
         * @returns {Konva.Transform}
         */
        getAbsoluteTransform(top) {
            // if using an argument, we can't cache the result.
            if (top) {
                return this._getAbsoluteTransform(top);
            }
            else {
                // if no argument, we can cache the result
                return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
            }
        }
        _getAbsoluteTransform(top) {
            var at;
            // we we need position relative to an ancestor, we will iterate for all
            if (top) {
                at = new Transform();
                // start with stage and traverse downwards to self
                this._eachAncestorReverse(function (node) {
                    var transformsEnabled = node.transformsEnabled();
                    if (transformsEnabled === 'all') {
                        at.multiply(node.getTransform());
                    }
                    else if (transformsEnabled === 'position') {
                        at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
                    }
                }, top);
                return at;
            }
            else {
                // try to use a cached value
                at = this._cache.get(ABSOLUTE_TRANSFORM) || new Transform();
                if (this.parent) {
                    // transform will be cached
                    this.parent.getAbsoluteTransform().copyInto(at);
                }
                else {
                    at.reset();
                }
                var transformsEnabled = this.transformsEnabled();
                if (transformsEnabled === 'all') {
                    at.multiply(this.getTransform());
                }
                else if (transformsEnabled === 'position') {
                    // use "attrs" directly, because it is a bit faster
                    const x = this.attrs.x || 0;
                    const y = this.attrs.y || 0;
                    const offsetX = this.attrs.offsetX || 0;
                    const offsetY = this.attrs.offsetY || 0;
                    at.translate(x - offsetX, y - offsetY);
                }
                at.dirty = false;
                return at;
            }
        }
        /**
         * get absolute scale of the node which takes into
         *  account its ancestor scales
         * @method
         * @name Konva.Node#getAbsoluteScale
         * @returns {Object}
         * @example
         * // get absolute scale x
         * var scaleX = node.getAbsoluteScale().x;
         */
        getAbsoluteScale(top) {
            // do not cache this calculations,
            // because it use cache transform
            // this is special logic for caching with some shapes with shadow
            var parent = this;
            while (parent) {
                if (parent._isUnderCache) {
                    top = parent;
                }
                parent = parent.getParent();
            }
            const transform = this.getAbsoluteTransform(top);
            const attrs = transform.decompose();
            return {
                x: attrs.scaleX,
                y: attrs.scaleY,
            };
        }
        /**
         * get absolute rotation of the node which takes into
         *  account its ancestor rotations
         * @method
         * @name Konva.Node#getAbsoluteRotation
         * @returns {Number}
         * @example
         * // get absolute rotation
         * var rotation = node.getAbsoluteRotation();
         */
        getAbsoluteRotation() {
            // var parent: Node = this;
            // var rotation = 0;
            // while (parent) {
            //   rotation += parent.rotation();
            //   parent = parent.getParent();
            // }
            // return rotation;
            return this.getAbsoluteTransform().decompose().rotation;
        }
        /**
         * get transform of the node
         * @method
         * @name Konva.Node#getTransform
         * @returns {Konva.Transform}
         */
        getTransform() {
            return this._getCache(TRANSFORM, this._getTransform);
        }
        _getTransform() {
            var _a, _b;
            var m = this._cache.get(TRANSFORM) || new Transform();
            m.reset();
            // I was trying to use attributes directly here
            // but it doesn't work for Transformer well
            // because it overwrite x,y getters
            var x = this.x(), y = this.y(), rotation = Konva$2.getAngle(this.rotation()), scaleX = (_a = this.attrs.scaleX) !== null && _a !== void 0 ? _a : 1, scaleY = (_b = this.attrs.scaleY) !== null && _b !== void 0 ? _b : 1, skewX = this.attrs.skewX || 0, skewY = this.attrs.skewY || 0, offsetX = this.attrs.offsetX || 0, offsetY = this.attrs.offsetY || 0;
            if (x !== 0 || y !== 0) {
                m.translate(x, y);
            }
            if (rotation !== 0) {
                m.rotate(rotation);
            }
            if (skewX !== 0 || skewY !== 0) {
                m.skew(skewX, skewY);
            }
            if (scaleX !== 1 || scaleY !== 1) {
                m.scale(scaleX, scaleY);
            }
            if (offsetX !== 0 || offsetY !== 0) {
                m.translate(-1 * offsetX, -1 * offsetY);
            }
            m.dirty = false;
            return m;
        }
        /**
         * clone node.  Returns a new Node instance with identical attributes.  You can also override
         *  the node properties with an object literal, enabling you to use an existing node as a template
         *  for another node
         * @method
         * @name Konva.Node#clone
         * @param {Object} obj override attrs
         * @returns {Konva.Node}
         * @example
         * // simple clone
         * var clone = node.clone();
         *
         * // clone a node and override the x position
         * var clone = rect.clone({
         *   x: 5
         * });
         */
        clone(obj) {
            // instantiate new node
            var attrs = Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
            // apply attr overrides
            for (key in obj) {
                attrs[key] = obj[key];
            }
            var node = new this.constructor(attrs);
            // copy over listeners
            for (key in this.eventListeners) {
                allListeners = this.eventListeners[key];
                len = allListeners.length;
                for (n = 0; n < len; n++) {
                    listener = allListeners[n];
                    /*
                     * don't include konva namespaced listeners because
                     *  these are generated by the constructors
                     */
                    if (listener.name.indexOf(KONVA) < 0) {
                        // if listeners array doesn't exist, then create it
                        if (!node.eventListeners[key]) {
                            node.eventListeners[key] = [];
                        }
                        node.eventListeners[key].push(listener);
                    }
                }
            }
            return node;
        }
        _toKonvaCanvas(config) {
            config = config || {};
            var box = this.getClientRect();
            var stage = this.getStage(), x = config.x !== undefined ? config.x : box.x, y = config.y !== undefined ? config.y : box.y, pixelRatio = config.pixelRatio || 1, canvas = new SceneCanvas({
                width: config.width || box.width || (stage ? stage.width() : 0),
                height: config.height || box.height || (stage ? stage.height() : 0),
                pixelRatio: pixelRatio,
            }), context = canvas.getContext();
            context.save();
            if (x || y) {
                context.translate(-1 * x, -1 * y);
            }
            this.drawScene(canvas);
            context.restore();
            return canvas;
        }
        /**
         * converts node into an canvas element.
         * @method
         * @name Konva.Node#toCanvas
         * @param {Object} config
         * @param {Function} config.callback function executed when the composite has completed
         * @param {Number} [config.x] x position of canvas section
         * @param {Number} [config.y] y position of canvas section
         * @param {Number} [config.width] width of canvas section
         * @param {Number} [config.height] height of canvas section
         * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
         * You can use that property to increase quality of the image, for example for super hight quality exports
         * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
         * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
         * @example
         * var canvas = node.toCanvas();
         */
        toCanvas(config) {
            return this._toKonvaCanvas(config)._canvas;
        }
        /**
         * Creates a composite data URL (base64 string). If MIME type is not
         * specified, then "image/png" will result. For "image/jpeg", specify a quality
         * level as quality (range 0.0 - 1.0)
         * @method
         * @name Konva.Node#toDataURL
         * @param {Object} config
         * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
         *  "image/png" is the default
         * @param {Number} [config.x] x position of canvas section
         * @param {Number} [config.y] y position of canvas section
         * @param {Number} [config.width] width of canvas section
         * @param {Number} [config.height] height of canvas section
         * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
         *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
         *  is very high quality
         * @param {Number} [config.pixelRatio] pixelRatio of output image url. Default is 1.
         * You can use that property to increase quality of the image, for example for super hight quality exports
         * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
         * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
         * @returns {String}
         */
        toDataURL(config) {
            config = config || {};
            var mimeType = config.mimeType || null, quality = config.quality || null;
            var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
            if (config.callback) {
                config.callback(url);
            }
            return url;
        }
        /**
         * converts node into an image.  Since the toImage
         *  method is asynchronous, a callback is required.  toImage is most commonly used
         *  to cache complex drawings as an image so that they don't have to constantly be redrawn
         * @method
         * @name Konva.Node#toImage
         * @param {Object} config
         * @param {Function} config.callback function executed when the composite has completed
         * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
         *  "image/png" is the default
         * @param {Number} [config.x] x position of canvas section
         * @param {Number} [config.y] y position of canvas section
         * @param {Number} [config.width] width of canvas section
         * @param {Number} [config.height] height of canvas section
         * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
         *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
         *  is very high quality
         * @param {Number} [config.pixelRatio] pixelRatio of output image. Default is 1.
         * You can use that property to increase quality of the image, for example for super hight quality exports
         * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
         * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
         * @example
         * var image = node.toImage({
         *   callback(img) {
         *     // do stuff with img
         *   }
         * });
         */
        toImage(config) {
            if (!config || !config.callback) {
                throw 'callback required for toImage method config argument';
            }
            var callback = config.callback;
            delete config.callback;
            Util._urlToImage(this.toDataURL(config), function (img) {
                callback(img);
            });
        }
        setSize(size) {
            this.width(size.width);
            this.height(size.height);
            return this;
        }
        getSize() {
            return {
                width: this.width(),
                height: this.height(),
            };
        }
        /**
         * get class name, which may return Stage, Layer, Group, or shape class names like Rect, Circle, Text, etc.
         * @method
         * @name Konva.Node#getClassName
         * @returns {String}
         */
        getClassName() {
            return this.className || this.nodeType;
        }
        /**
         * get the node type, which may return Stage, Layer, Group, or Shape
         * @method
         * @name Konva.Node#getType
         * @returns {String}
         */
        getType() {
            return this.nodeType;
        }
        getDragDistance() {
            // compare with undefined because we need to track 0 value
            if (this.attrs.dragDistance !== undefined) {
                return this.attrs.dragDistance;
            }
            else if (this.parent) {
                return this.parent.getDragDistance();
            }
            else {
                return Konva$2.dragDistance;
            }
        }
        _off(type, name, callback) {
            var evtListeners = this.eventListeners[type], i, evtName, handler;
            for (i = 0; i < evtListeners.length; i++) {
                evtName = evtListeners[i].name;
                handler = evtListeners[i].handler;
                // the following two conditions must be true in order to remove a handler:
                // 1) the current event name cannot be konva unless the event name is konva
                //    this enables developers to force remove a konva specific listener for whatever reason
                // 2) an event name is not specified, or if one is specified, it matches the current event name
                if ((evtName !== 'konva' || name === 'konva') &&
                    (!name || evtName === name) &&
                    (!callback || callback === handler)) {
                    evtListeners.splice(i, 1);
                    if (evtListeners.length === 0) {
                        delete this.eventListeners[type];
                        break;
                    }
                    i--;
                }
            }
        }
        _fireChangeEvent(attr, oldVal, newVal) {
            this._fire(attr + CHANGE, {
                oldVal: oldVal,
                newVal: newVal,
            });
        }
        /**
         * add name to node
         * @method
         * @name Konva.Node#addName
         * @param {String} name
         * @returns {Konva.Node}
         * @example
         * node.name('red');
         * node.addName('selected');
         * node.name(); // return 'red selected'
         */
        addName(name) {
            if (!this.hasName(name)) {
                var oldName = this.name();
                var newName = oldName ? oldName + ' ' + name : name;
                this.name(newName);
            }
            return this;
        }
        /**
         * check is node has name
         * @method
         * @name Konva.Node#hasName
         * @param {String} name
         * @returns {Boolean}
         * @example
         * node.name('red');
         * node.hasName('red');   // return true
         * node.hasName('selected'); // return false
         * node.hasName(''); // return false
         */
        hasName(name) {
            if (!name) {
                return false;
            }
            const fullName = this.name();
            if (!fullName) {
                return false;
            }
            // if name is '' the "names" will be [''], so I added extra check above
            var names = (fullName || '').split(/\s/g);
            return names.indexOf(name) !== -1;
        }
        /**
         * remove name from node
         * @method
         * @name Konva.Node#removeName
         * @param {String} name
         * @returns {Konva.Node}
         * @example
         * node.name('red selected');
         * node.removeName('selected');
         * node.hasName('selected'); // return false
         * node.name(); // return 'red'
         */
        removeName(name) {
            var names = (this.name() || '').split(/\s/g);
            var index = names.indexOf(name);
            if (index !== -1) {
                names.splice(index, 1);
                this.name(names.join(' '));
            }
            return this;
        }
        /**
         * set attr
         * @method
         * @name Konva.Node#setAttr
         * @param {String} attr
         * @param {*} val
         * @returns {Konva.Node}
         * @example
         * node.setAttr('x', 5);
         */
        setAttr(attr, val) {
            var func = this[SET + Util._capitalize(attr)];
            if (Util._isFunction(func)) {
                func.call(this, val);
            }
            else {
                // otherwise set directly
                this._setAttr(attr, val);
            }
            return this;
        }
        _requestDraw() {
            if (Konva$2.autoDrawEnabled) {
                const drawNode = this.getLayer() || this.getStage();
                drawNode === null || drawNode === void 0 ? void 0 : drawNode.batchDraw();
            }
        }
        _setAttr(key, val) {
            var oldVal = this.attrs[key];
            if (oldVal === val && !Util.isObject(val)) {
                return;
            }
            if (val === undefined || val === null) {
                delete this.attrs[key];
            }
            else {
                this.attrs[key] = val;
            }
            if (this._shouldFireChangeEvents) {
                this._fireChangeEvent(key, oldVal, val);
            }
            this._requestDraw();
        }
        _setComponentAttr(key, component, val) {
            var oldVal;
            if (val !== undefined) {
                oldVal = this.attrs[key];
                if (!oldVal) {
                    // set value to default value using getAttr
                    this.attrs[key] = this.getAttr(key);
                }
                this.attrs[key][component] = val;
                this._fireChangeEvent(key, oldVal, val);
            }
        }
        _fireAndBubble(eventType, evt, compareShape) {
            if (evt && this.nodeType === SHAPE) {
                evt.target = this;
            }
            var shouldStop = (eventType === MOUSEENTER$1 || eventType === MOUSELEAVE$1) &&
                ((compareShape &&
                    (this === compareShape ||
                        (this.isAncestorOf && this.isAncestorOf(compareShape)))) ||
                    (this.nodeType === 'Stage' && !compareShape));
            if (!shouldStop) {
                this._fire(eventType, evt);
                // simulate event bubbling
                var stopBubble = (eventType === MOUSEENTER$1 || eventType === MOUSELEAVE$1) &&
                    compareShape &&
                    compareShape.isAncestorOf &&
                    compareShape.isAncestorOf(this) &&
                    !compareShape.isAncestorOf(this.parent);
                if (((evt && !evt.cancelBubble) || !evt) &&
                    this.parent &&
                    this.parent.isListening() &&
                    !stopBubble) {
                    if (compareShape && compareShape.parent) {
                        this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
                    }
                    else {
                        this._fireAndBubble.call(this.parent, eventType, evt);
                    }
                }
            }
        }
        _getProtoListeners(eventType) {
            let listeners = this._cache.get(ALL_LISTENERS);
            // if no cache for listeners, we need to pre calculate it
            if (!listeners) {
                listeners = {};
                let obj = Object.getPrototypeOf(this);
                while (obj) {
                    if (!obj.eventListeners) {
                        obj = Object.getPrototypeOf(obj);
                        continue;
                    }
                    for (var event in obj.eventListeners) {
                        const newEvents = obj.eventListeners[event];
                        const oldEvents = listeners[event] || [];
                        listeners[event] = newEvents.concat(oldEvents);
                    }
                    obj = Object.getPrototypeOf(obj);
                }
                this._cache.set(ALL_LISTENERS, listeners);
            }
            return listeners[eventType];
        }
        _fire(eventType, evt) {
            evt = evt || {};
            evt.currentTarget = this;
            evt.type = eventType;
            const topListeners = this._getProtoListeners(eventType);
            if (topListeners) {
                for (var i = 0; i < topListeners.length; i++) {
                    topListeners[i].handler.call(this, evt);
                }
            }
            // it is important to iterate over self listeners without cache
            // because events can be added/removed while firing
            const selfListeners = this.eventListeners[eventType];
            if (selfListeners) {
                for (var i = 0; i < selfListeners.length; i++) {
                    selfListeners[i].handler.call(this, evt);
                }
            }
        }
        /**
         * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redrawn
         * @method
         * @name Konva.Node#draw
         * @returns {Konva.Node}
         */
        draw() {
            this.drawScene();
            this.drawHit();
            return this;
        }
        // drag & drop
        _createDragElement(evt) {
            var pointerId = evt ? evt.pointerId : undefined;
            var stage = this.getStage();
            var ap = this.getAbsolutePosition();
            var pos = stage._getPointerById(pointerId) ||
                stage._changedPointerPositions[0] ||
                ap;
            DD._dragElements.set(this._id, {
                node: this,
                startPointerPos: pos,
                offset: {
                    x: pos.x - ap.x,
                    y: pos.y - ap.y,
                },
                dragStatus: 'ready',
                pointerId,
            });
        }
        /**
         * initiate drag and drop.
         * @method
         * @name Konva.Node#startDrag
         */
        startDrag(evt, bubbleEvent = true) {
            if (!DD._dragElements.has(this._id)) {
                this._createDragElement(evt);
            }
            const elem = DD._dragElements.get(this._id);
            elem.dragStatus = 'dragging';
            this.fire('dragstart', {
                type: 'dragstart',
                target: this,
                evt: evt && evt.evt,
            }, bubbleEvent);
        }
        _setDragPosition(evt, elem) {
            // const pointers = this.getStage().getPointersPositions();
            // const pos = pointers.find(p => p.id === this._dragEventId);
            const pos = this.getStage()._getPointerById(elem.pointerId);
            if (!pos) {
                return;
            }
            var newNodePos = {
                x: pos.x - elem.offset.x,
                y: pos.y - elem.offset.y,
            };
            var dbf = this.dragBoundFunc();
            if (dbf !== undefined) {
                const bounded = dbf.call(this, newNodePos, evt);
                if (!bounded) {
                    Util.warn('dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.');
                }
                else {
                    newNodePos = bounded;
                }
            }
            if (!this._lastPos ||
                this._lastPos.x !== newNodePos.x ||
                this._lastPos.y !== newNodePos.y) {
                this.setAbsolutePosition(newNodePos);
                this._requestDraw();
            }
            this._lastPos = newNodePos;
        }
        /**
         * stop drag and drop
         * @method
         * @name Konva.Node#stopDrag
         */
        stopDrag(evt) {
            const elem = DD._dragElements.get(this._id);
            if (elem) {
                elem.dragStatus = 'stopped';
            }
            DD._endDragBefore(evt);
            DD._endDragAfter(evt);
        }
        setDraggable(draggable) {
            this._setAttr('draggable', draggable);
            this._dragChange();
        }
        /**
         * determine if node is currently in drag and drop mode
         * @method
         * @name Konva.Node#isDragging
         */
        isDragging() {
            const elem = DD._dragElements.get(this._id);
            return elem ? elem.dragStatus === 'dragging' : false;
        }
        _listenDrag() {
            this._dragCleanup();
            this.on('mousedown.konva touchstart.konva', function (evt) {
                var shouldCheckButton = evt.evt['button'] !== undefined;
                var canDrag = !shouldCheckButton || Konva$2.dragButtons.indexOf(evt.evt['button']) >= 0;
                if (!canDrag) {
                    return;
                }
                if (this.isDragging()) {
                    return;
                }
                var hasDraggingChild = false;
                DD._dragElements.forEach((elem) => {
                    if (this.isAncestorOf(elem.node)) {
                        hasDraggingChild = true;
                    }
                });
                // nested drag can be started
                // in that case we don't need to start new drag
                if (!hasDraggingChild) {
                    this._createDragElement(evt);
                }
            });
        }
        _dragChange() {
            if (this.attrs.draggable) {
                this._listenDrag();
            }
            else {
                // remove event listeners
                this._dragCleanup();
                /*
                 * force drag and drop to end
                 * if this node is currently in
                 * drag and drop mode
                 */
                var stage = this.getStage();
                if (!stage) {
                    return;
                }
                const dragElement = DD._dragElements.get(this._id);
                const isDragging = dragElement && dragElement.dragStatus === 'dragging';
                const isReady = dragElement && dragElement.dragStatus === 'ready';
                if (isDragging) {
                    this.stopDrag();
                }
                else if (isReady) {
                    DD._dragElements.delete(this._id);
                }
            }
        }
        _dragCleanup() {
            this.off('mousedown.konva');
            this.off('touchstart.konva');
        }
        /**
         * determine if node (at least partially) is currently in user-visible area
         * @method
         * @param {(Number | Object)} margin optional margin in pixels
         * @param {Number} margin.x
         * @param {Number} margin.y
         * @returns {Boolean}
         * @name Konva.Node#isClientRectOnScreen
         * @example
         * // get index
         * // default calculations
         * var isOnScreen = node.isClientRectOnScreen()
         * // increase object size (or screen size) for cases when objects close to the screen still need to be marked as "visible"
         * var isOnScreen = node.isClientRectOnScreen({ x: stage.width(), y: stage.height() })
         */
        isClientRectOnScreen(margin = { x: 0, y: 0 }) {
            const stage = this.getStage();
            if (!stage) {
                return false;
            }
            const screenRect = {
                x: -margin.x,
                y: -margin.y,
                width: stage.width() + margin.x,
                height: stage.height() + margin.y,
            };
            return Util.haveIntersection(screenRect, this.getClientRect());
        }
        /**
         * create node with JSON string or an Object.  De-serializtion does not generate custom
         *  shape drawing functions, images, or event handlers (this would make the
         *  serialized object huge).  If your app uses custom shapes, images, and
         *  event handlers (it probably does), then you need to select the appropriate
         *  shapes after loading the stage and set these properties via on(), setSceneFunc(),
         *  and setImage() methods
         * @method
         * @memberof Konva.Node
         * @param {String|Object} json string or object
         * @param {Element} [container] optional container dom element used only if you're
         *  creating a stage node
         */
        static create(data, container) {
            if (Util._isString(data)) {
                data = JSON.parse(data);
            }
            return this._createNode(data, container);
        }
        static _createNode(obj, container) {
            var className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
            // if container was passed in, add it to attrs
            if (container) {
                obj.attrs.container = container;
            }
            if (!Konva$2[className]) {
                Util.warn('Can not find a node with class name "' +
                    className +
                    '". Fallback to "Shape".');
                className = 'Shape';
            }
            const Class = Konva$2[className];
            no = new Class(obj.attrs);
            if (children) {
                len = children.length;
                for (n = 0; n < len; n++) {
                    no.add(Node._createNode(children[n]));
                }
            }
            return no;
        }
    }
    Node.prototype.nodeType = 'Node';
    Node.prototype._attrsAffectingSize = [];
    // attache events listeners once into prototype
    // that way we don't spend too much time on making an new instance
    Node.prototype.eventListeners = {};
    Node.prototype.on.call(Node.prototype, TRANSFORM_CHANGE_STR$1, function () {
        if (this._batchingTransformChange) {
            this._needClearTransformCache = true;
            return;
        }
        this._clearCache(TRANSFORM);
        this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    });
    Node.prototype.on.call(Node.prototype, 'visibleChange.konva', function () {
        this._clearSelfAndDescendantCache(VISIBLE);
    });
    Node.prototype.on.call(Node.prototype, 'listeningChange.konva', function () {
        this._clearSelfAndDescendantCache(LISTENING);
    });
    Node.prototype.on.call(Node.prototype, 'opacityChange.konva', function () {
        this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    });
    const addGetterSetter = Factory.addGetterSetter;
    /**
     * get/set zIndex relative to the node's siblings who share the same parent.
     * Please remember that zIndex is not absolute (like in CSS). It is relative to parent element only.
     * @name Konva.Node#zIndex
     * @method
     * @param {Number} index
     * @returns {Number}
     * @example
     * // get index
     * var index = node.zIndex();
     *
     * // set index
     * node.zIndex(2);
     */
    addGetterSetter(Node, 'zIndex');
    /**
     * get/set node absolute position
     * @name Konva.Node#absolutePosition
     * @method
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Object}
     * @example
     * // get position
     * var position = node.absolutePosition();
     *
     * // set position
     * node.absolutePosition({
     *   x: 5,
     *   y: 10
     * });
     */
    addGetterSetter(Node, 'absolutePosition');
    addGetterSetter(Node, 'position');
    /**
     * get/set node position relative to parent
     * @name Konva.Node#position
     * @method
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Object}
     * @example
     * // get position
     * var position = node.position();
     *
     * // set position
     * node.position({
     *   x: 5,
     *   y: 10
     * });
     */
    addGetterSetter(Node, 'x', 0, getNumberValidator());
    /**
     * get/set x position
     * @name Konva.Node#x
     * @method
     * @param {Number} x
     * @returns {Object}
     * @example
     * // get x
     * var x = node.x();
     *
     * // set x
     * node.x(5);
     */
    addGetterSetter(Node, 'y', 0, getNumberValidator());
    /**
     * get/set y position
     * @name Konva.Node#y
     * @method
     * @param {Number} y
     * @returns {Integer}
     * @example
     * // get y
     * var y = node.y();
     *
     * // set y
     * node.y(5);
     */
    addGetterSetter(Node, 'globalCompositeOperation', 'source-over', getStringValidator());
    /**
     * get/set globalCompositeOperation of a node. globalCompositeOperation DOESN'T affect hit graph of nodes. So they are still trigger to events as they have default "source-over" globalCompositeOperation.
     * @name Konva.Node#globalCompositeOperation
     * @method
     * @param {String} type
     * @returns {String}
     * @example
     * // get globalCompositeOperation
     * var globalCompositeOperation = shape.globalCompositeOperation();
     *
     * // set globalCompositeOperation
     * shape.globalCompositeOperation('source-in');
     */
    addGetterSetter(Node, 'opacity', 1, getNumberValidator());
    /**
     * get/set opacity.  Opacity values range from 0 to 1.
     *  A node with an opacity of 0 is fully transparent, and a node
     *  with an opacity of 1 is fully opaque
     * @name Konva.Node#opacity
     * @method
     * @param {Object} opacity
     * @returns {Number}
     * @example
     * // get opacity
     * var opacity = node.opacity();
     *
     * // set opacity
     * node.opacity(0.5);
     */
    addGetterSetter(Node, 'name', '', getStringValidator());
    /**
     * get/set name.
     * @name Konva.Node#name
     * @method
     * @param {String} name
     * @returns {String}
     * @example
     * // get name
     * var name = node.name();
     *
     * // set name
     * node.name('foo');
     *
     * // also node may have multiple names (as css classes)
     * node.name('foo bar');
     */
    addGetterSetter(Node, 'id', '', getStringValidator());
    /**
     * get/set id. Id is global for whole page.
     * @name Konva.Node#id
     * @method
     * @param {String} id
     * @returns {String}
     * @example
     * // get id
     * var name = node.id();
     *
     * // set id
     * node.id('foo');
     */
    addGetterSetter(Node, 'rotation', 0, getNumberValidator());
    /**
     * get/set rotation in degrees
     * @name Konva.Node#rotation
     * @method
     * @param {Number} rotation
     * @returns {Number}
     * @example
     * // get rotation in degrees
     * var rotation = node.rotation();
     *
     * // set rotation in degrees
     * node.rotation(45);
     */
    Factory.addComponentsGetterSetter(Node, 'scale', ['x', 'y']);
    /**
     * get/set scale
     * @name Konva.Node#scale
     * @param {Object} scale
     * @param {Number} scale.x
     * @param {Number} scale.y
     * @method
     * @returns {Object}
     * @example
     * // get scale
     * var scale = node.scale();
     *
     * // set scale
     * shape.scale({
     *   x: 2,
     *   y: 3
     * });
     */
    addGetterSetter(Node, 'scaleX', 1, getNumberValidator());
    /**
     * get/set scale x
     * @name Konva.Node#scaleX
     * @param {Number} x
     * @method
     * @returns {Number}
     * @example
     * // get scale x
     * var scaleX = node.scaleX();
     *
     * // set scale x
     * node.scaleX(2);
     */
    addGetterSetter(Node, 'scaleY', 1, getNumberValidator());
    /**
     * get/set scale y
     * @name Konva.Node#scaleY
     * @param {Number} y
     * @method
     * @returns {Number}
     * @example
     * // get scale y
     * var scaleY = node.scaleY();
     *
     * // set scale y
     * node.scaleY(2);
     */
    Factory.addComponentsGetterSetter(Node, 'skew', ['x', 'y']);
    /**
     * get/set skew
     * @name Konva.Node#skew
     * @param {Object} skew
     * @param {Number} skew.x
     * @param {Number} skew.y
     * @method
     * @returns {Object}
     * @example
     * // get skew
     * var skew = node.skew();
     *
     * // set skew
     * node.skew({
     *   x: 20,
     *   y: 10
     * });
     */
    addGetterSetter(Node, 'skewX', 0, getNumberValidator());
    /**
     * get/set skew x
     * @name Konva.Node#skewX
     * @param {Number} x
     * @method
     * @returns {Number}
     * @example
     * // get skew x
     * var skewX = node.skewX();
     *
     * // set skew x
     * node.skewX(3);
     */
    addGetterSetter(Node, 'skewY', 0, getNumberValidator());
    /**
     * get/set skew y
     * @name Konva.Node#skewY
     * @param {Number} y
     * @method
     * @returns {Number}
     * @example
     * // get skew y
     * var skewY = node.skewY();
     *
     * // set skew y
     * node.skewY(3);
     */
    Factory.addComponentsGetterSetter(Node, 'offset', ['x', 'y']);
    /**
     * get/set offset.  Offsets the default position and rotation point
     * @method
     * @param {Object} offset
     * @param {Number} offset.x
     * @param {Number} offset.y
     * @returns {Object}
     * @example
     * // get offset
     * var offset = node.offset();
     *
     * // set offset
     * node.offset({
     *   x: 20,
     *   y: 10
     * });
     */
    addGetterSetter(Node, 'offsetX', 0, getNumberValidator());
    /**
     * get/set offset x
     * @name Konva.Node#offsetX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get offset x
     * var offsetX = node.offsetX();
     *
     * // set offset x
     * node.offsetX(3);
     */
    addGetterSetter(Node, 'offsetY', 0, getNumberValidator());
    /**
     * get/set offset y
     * @name Konva.Node#offsetY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get offset y
     * var offsetY = node.offsetY();
     *
     * // set offset y
     * node.offsetY(3);
     */
    addGetterSetter(Node, 'dragDistance', null, getNumberValidator());
    /**
     * get/set drag distance
     * @name Konva.Node#dragDistance
     * @method
     * @param {Number} distance
     * @returns {Number}
     * @example
     * // get drag distance
     * var dragDistance = node.dragDistance();
     *
     * // set distance
     * // node starts dragging only if pointer moved more then 3 pixels
     * node.dragDistance(3);
     * // or set globally
     * Konva.dragDistance = 3;
     */
    addGetterSetter(Node, 'width', 0, getNumberValidator());
    /**
     * get/set width
     * @name Konva.Node#width
     * @method
     * @param {Number} width
     * @returns {Number}
     * @example
     * // get width
     * var width = node.width();
     *
     * // set width
     * node.width(100);
     */
    addGetterSetter(Node, 'height', 0, getNumberValidator());
    /**
     * get/set height
     * @name Konva.Node#height
     * @method
     * @param {Number} height
     * @returns {Number}
     * @example
     * // get height
     * var height = node.height();
     *
     * // set height
     * node.height(100);
     */
    addGetterSetter(Node, 'listening', true, getBooleanValidator());
    /**
     * get/set listening attr.  If you need to determine if a node is listening or not
     *   by taking into account its parents, use the isListening() method
     * @name Konva.Node#listening
     * @method
     * @param {Boolean} listening Can be true, or false.  The default is true.
     * @returns {Boolean}
     * @example
     * // get listening attr
     * var listening = node.listening();
     *
     * // stop listening for events, remove node and all its children from hit graph
     * node.listening(false);
     *
     * // listen to events according to the parent
     * node.listening(true);
     */
    /**
     * get/set preventDefault
     * By default all shapes will prevent default behavior
     * of a browser on a pointer move or tap.
     * that will prevent native scrolling when you are trying to drag&drop a node
     * but sometimes you may need to enable default actions
     * in that case you can set the property to false
     * @name Konva.Node#preventDefault
     * @method
     * @param {Boolean} preventDefault
     * @returns {Boolean}
     * @example
     * // get preventDefault
     * var shouldPrevent = shape.preventDefault();
     *
     * // set preventDefault
     * shape.preventDefault(false);
     */
    addGetterSetter(Node, 'preventDefault', true, getBooleanValidator());
    addGetterSetter(Node, 'filters', null, function (val) {
        this._filterUpToDate = false;
        return val;
    });
    /**
     * get/set filters.  Filters are applied to cached canvases
     * @name Konva.Node#filters
     * @method
     * @param {Array} filters array of filters
     * @returns {Array}
     * @example
     * // get filters
     * var filters = node.filters();
     *
     * // set a single filter
     * node.cache();
     * node.filters([Konva.Filters.Blur]);
     *
     * // set multiple filters
     * node.cache();
     * node.filters([
     *   Konva.Filters.Blur,
     *   Konva.Filters.Sepia,
     *   Konva.Filters.Invert
     * ]);
     */
    addGetterSetter(Node, 'visible', true, getBooleanValidator());
    /**
     * get/set visible attr.  Can be true, or false.  The default is true.
     *   If you need to determine if a node is visible or not
     *   by taking into account its parents, use the isVisible() method
     * @name Konva.Node#visible
     * @method
     * @param {Boolean} visible
     * @returns {Boolean}
     * @example
     * // get visible attr
     * var visible = node.visible();
     *
     * // make invisible
     * node.visible(false);
     *
     * // make visible (according to the parent)
     * node.visible(true);
     *
     */
    addGetterSetter(Node, 'transformsEnabled', 'all', getStringValidator());
    /**
     * get/set transforms that are enabled.  Can be "all", "none", or "position".  The default
     *  is "all"
     * @name Konva.Node#transformsEnabled
     * @method
     * @param {String} enabled
     * @returns {String}
     * @example
     * // enable position transform only to improve draw performance
     * node.transformsEnabled('position');
     *
     * // enable all transforms
     * node.transformsEnabled('all');
     */
    /**
     * get/set node size
     * @name Konva.Node#size
     * @method
     * @param {Object} size
     * @param {Number} size.width
     * @param {Number} size.height
     * @returns {Object}
     * @example
     * // get node size
     * var size = node.size();
     * var width = size.width;
     * var height = size.height;
     *
     * // set size
     * node.size({
     *   width: 100,
     *   height: 200
     * });
     */
    addGetterSetter(Node, 'size');
    /**
     * get/set drag bound function.  This is used to override the default
     *  drag and drop position.
     * @name Konva.Node#dragBoundFunc
     * @method
     * @param {Function} dragBoundFunc
     * @returns {Function}
     * @example
     * // get drag bound function
     * var dragBoundFunc = node.dragBoundFunc();
     *
     * // create vertical drag and drop
     * node.dragBoundFunc(function(pos){
     *   // important pos - is absolute position of the node
     *   // you should return absolute position too
     *   return {
     *     x: this.absolutePosition().x,
     *     y: pos.y
     *   };
     * });
     */
    addGetterSetter(Node, 'dragBoundFunc');
    /**
     * get/set draggable flag
     * @name Konva.Node#draggable
     * @method
     * @param {Boolean} draggable
     * @returns {Boolean}
     * @example
     * // get draggable flag
     * var draggable = node.draggable();
     *
     * // enable drag and drop
     * node.draggable(true);
     *
     * // disable drag and drop
     * node.draggable(false);
     */
    addGetterSetter(Node, 'draggable', false, getBooleanValidator());
    Factory.backCompat(Node, {
        rotateDeg: 'rotate',
        setRotationDeg: 'setRotation',
        getRotationDeg: 'getRotation',
    });
  
    /**
     * Container constructor.&nbsp; Containers are used to contain nodes or other containers
     * @constructor
     * @memberof Konva
     * @augments Konva.Node
     * @abstract
     * @param {Object} config
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * * @param {Object} [config.clip] set clip
       * @param {Number} [config.clipX] set clip x
       * @param {Number} [config.clipY] set clip y
       * @param {Number} [config.clipWidth] set clip width
       * @param {Number} [config.clipHeight] set clip height
       * @param {Function} [config.clipFunc] set clip func
  
     */
    class Container extends Node {
        constructor() {
            super(...arguments);
            this.children = [];
        }
        /**
         * returns an array of direct descendant nodes
         * @method
         * @name Konva.Container#getChildren
         * @param {Function} [filterFunc] filter function
         * @returns {Array}
         * @example
         * // get all children
         * var children = layer.getChildren();
         *
         * // get only circles
         * var circles = layer.getChildren(function(node){
         *    return node.getClassName() === 'Circle';
         * });
         */
        getChildren(filterFunc) {
            if (!filterFunc) {
                return this.children || [];
            }
            const children = this.children || [];
            var results = [];
            children.forEach(function (child) {
                if (filterFunc(child)) {
                    results.push(child);
                }
            });
            return results;
        }
        /**
         * determine if node has children
         * @method
         * @name Konva.Container#hasChildren
         * @returns {Boolean}
         */
        hasChildren() {
            return this.getChildren().length > 0;
        }
        /**
         * remove all children. Children will be still in memory.
         * If you want to completely destroy all children please use "destroyChildren" method instead
         * @method
         * @name Konva.Container#removeChildren
         */
        removeChildren() {
            this.getChildren().forEach((child) => {
                // reset parent to prevent many _setChildrenIndices calls
                child.parent = null;
                child.index = 0;
                child.remove();
            });
            this.children = [];
            // because all children were detached from parent, request draw via container
            this._requestDraw();
            return this;
        }
        /**
         * destroy all children nodes.
         * @method
         * @name Konva.Container#destroyChildren
         */
        destroyChildren() {
            this.getChildren().forEach((child) => {
                // reset parent to prevent many _setChildrenIndices calls
                child.parent = null;
                child.index = 0;
                child.destroy();
            });
            this.children = [];
            // because all children were detached from parent, request draw via container
            this._requestDraw();
            return this;
        }
        /**
         * add a child and children into container
         * @name Konva.Container#add
         * @method
         * @param {...Konva.Node} child
         * @returns {Container}
         * @example
         * layer.add(rect);
         * layer.add(shape1, shape2, shape3);
         * // remember to redraw layer if you changed something
         * layer.draw();
         */
        add(...children) {
            if (arguments.length > 1) {
                for (var i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            var child = children[0];
            if (child.getParent()) {
                child.moveTo(this);
                return this;
            }
            this._validateAdd(child);
            child.index = this.getChildren().length;
            child.parent = this;
            child._clearCaches();
            this.getChildren().push(child);
            this._fire('add', {
                child: child,
            });
            this._requestDraw();
            // chainable
            return this;
        }
        destroy() {
            if (this.hasChildren()) {
                this.destroyChildren();
            }
            super.destroy();
            return this;
        }
        /**
         * return an array of nodes that match the selector.
         * You can provide a string with '#' for id selections and '.' for name selections.
         * Or a function that will return true/false when a node is passed through.  See example below.
         * With strings you can also select by type or class name. Pass multiple selectors
         * separated by a comma.
         * @method
         * @name Konva.Container#find
         * @param {String | Function} selector
         * @returns {Array}
         * @example
         *
         * Passing a string as a selector
         * // select node with id foo
         * var node = stage.find('#foo');
         *
         * // select nodes with name bar inside layer
         * var nodes = layer.find('.bar');
         *
         * // select all groups inside layer
         * var nodes = layer.find('Group');
         *
         * // select all rectangles inside layer
         * var nodes = layer.find('Rect');
         *
         * // select node with an id of foo or a name of bar inside layer
         * var nodes = layer.find('#foo, .bar');
         *
         * Passing a function as a selector
         *
         * // get all groups with a function
         * var groups = stage.find(node => {
         *  return node.getType() === 'Group';
         * });
         *
         * // get only Nodes with partial opacity
         * var alphaNodes = layer.find(node => {
         *  return node.getType() === 'Node' && node.getAbsoluteOpacity() < 1;
         * });
         */
        find(selector) {
            // protecting _generalFind to prevent user from accidentally adding
            // second argument and getting unexpected `findOne` result
            return this._generalFind(selector, false);
        }
        /**
         * return a first node from `find` method
         * @method
         * @name Konva.Container#findOne
         * @param {String | Function} selector
         * @returns {Konva.Node | Undefined}
         * @example
         * // select node with id foo
         * var node = stage.findOne('#foo');
         *
         * // select node with name bar inside layer
         * var nodes = layer.findOne('.bar');
         *
         * // select the first node to return true in a function
         * var node = stage.findOne(node => {
         *  return node.getType() === 'Shape'
         * })
         */
        findOne(selector) {
            var result = this._generalFind(selector, true);
            return result.length > 0 ? result[0] : undefined;
        }
        _generalFind(selector, findOne) {
            var retArr = [];
            this._descendants((node) => {
                const valid = node._isMatch(selector);
                if (valid) {
                    retArr.push(node);
                }
                if (valid && findOne) {
                    return true;
                }
                return false;
            });
            return retArr;
        }
        _descendants(fn) {
            let shouldStop = false;
            const children = this.getChildren();
            for (const child of children) {
                shouldStop = fn(child);
                if (shouldStop) {
                    return true;
                }
                if (!child.hasChildren()) {
                    continue;
                }
                shouldStop = child._descendants(fn);
                if (shouldStop) {
                    return true;
                }
            }
            return false;
        }
        // extenders
        toObject() {
            var obj = Node.prototype.toObject.call(this);
            obj.children = [];
            this.getChildren().forEach((child) => {
                obj.children.push(child.toObject());
            });
            return obj;
        }
        /**
         * determine if node is an ancestor
         * of descendant
         * @method
         * @name Konva.Container#isAncestorOf
         * @param {Konva.Node} node
         */
        isAncestorOf(node) {
            var parent = node.getParent();
            while (parent) {
                if (parent._id === this._id) {
                    return true;
                }
                parent = parent.getParent();
            }
            return false;
        }
        clone(obj) {
            // call super method
            var node = Node.prototype.clone.call(this, obj);
            this.getChildren().forEach(function (no) {
                node.add(no.clone());
            });
            return node;
        }
        /**
         * get all shapes that intersect a point.  Note: because this method must clear a temporary
         * canvas and redraw every shape inside the container, it should only be used for special situations
         * because it performs very poorly.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
         * because it performs much better
         * @method
         * @name Konva.Container#getAllIntersections
         * @param {Object} pos
         * @param {Number} pos.x
         * @param {Number} pos.y
         * @returns {Array} array of shapes
         */
        getAllIntersections(pos) {
            var arr = [];
            this.find('Shape').forEach(function (shape) {
                if (shape.isVisible() && shape.intersects(pos)) {
                    arr.push(shape);
                }
            });
            return arr;
        }
        _clearSelfAndDescendantCache(attr) {
            var _a;
            super._clearSelfAndDescendantCache(attr);
            // skip clearing if node is cached with canvas
            // for performance reasons !!!
            if (this.isCached()) {
                return;
            }
            (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (node) {
                node._clearSelfAndDescendantCache(attr);
            });
        }
        _setChildrenIndices() {
            var _a;
            (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child, n) {
                child.index = n;
            });
            this._requestDraw();
        }
        drawScene(can, top) {
            var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas()), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
            var caching = canvas && canvas.isCache;
            if (!this.isVisible() && !caching) {
                return this;
            }
            if (cachedSceneCanvas) {
                context.save();
                var m = this.getAbsoluteTransform(top).getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                this._drawCachedSceneCanvas(context);
                context.restore();
            }
            else {
                this._drawChildren('drawScene', canvas, top);
            }
            return this;
        }
        drawHit(can, top) {
            if (!this.shouldDrawHit(top)) {
                return this;
            }
            var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
            if (cachedHitCanvas) {
                context.save();
                var m = this.getAbsoluteTransform(top).getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                this._drawCachedHitCanvas(context);
                context.restore();
            }
            else {
                this._drawChildren('drawHit', canvas, top);
            }
            return this;
        }
        _drawChildren(drawMethod, canvas, top) {
            var _a;
            var context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = (clipWidth && clipHeight) || clipFunc;
            const selfCache = top === this;
            if (hasClip) {
                context.save();
                var transform = this.getAbsoluteTransform(top);
                var m = transform.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                context.beginPath();
                if (clipFunc) {
                    clipFunc.call(this, context, this);
                }
                else {
                    var clipX = this.clipX();
                    var clipY = this.clipY();
                    context.rect(clipX, clipY, clipWidth, clipHeight);
                }
                context.clip();
                m = transform.copy().invert().getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }
            var hasComposition = !selfCache &&
                this.globalCompositeOperation() !== 'source-over' &&
                drawMethod === 'drawScene';
            if (hasComposition) {
                context.save();
                context._applyGlobalCompositeOperation(this);
            }
            (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
                child[drawMethod](canvas, top);
            });
            if (hasComposition) {
                context.restore();
            }
            if (hasClip) {
                context.restore();
            }
        }
        getClientRect(config) {
            var _a;
            config = config || {};
            var skipTransform = config.skipTransform;
            var relativeTo = config.relativeTo;
            var minX, minY, maxX, maxY;
            var selfRect = {
                x: Infinity,
                y: Infinity,
                width: 0,
                height: 0,
            };
            var that = this;
            (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
                // skip invisible children
                if (!child.visible()) {
                    return;
                }
                var rect = child.getClientRect({
                    relativeTo: that,
                    skipShadow: config.skipShadow,
                    skipStroke: config.skipStroke,
                });
                // skip invisible children (like empty groups)
                if (rect.width === 0 && rect.height === 0) {
                    return;
                }
                if (minX === undefined) {
                    // initial value for first child
                    minX = rect.x;
                    minY = rect.y;
                    maxX = rect.x + rect.width;
                    maxY = rect.y + rect.height;
                }
                else {
                    minX = Math.min(minX, rect.x);
                    minY = Math.min(minY, rect.y);
                    maxX = Math.max(maxX, rect.x + rect.width);
                    maxY = Math.max(maxY, rect.y + rect.height);
                }
            });
            // if child is group we need to make sure it has visible shapes inside
            var shapes = this.find('Shape');
            var hasVisible = false;
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                if (shape._isVisible(this)) {
                    hasVisible = true;
                    break;
                }
            }
            if (hasVisible && minX !== undefined) {
                selfRect = {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                };
            }
            else {
                selfRect = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                };
            }
            if (!skipTransform) {
                return this._transformedRect(selfRect, relativeTo);
            }
            return selfRect;
        }
    }
    // add getters setters
    Factory.addComponentsGetterSetter(Container, 'clip', [
        'x',
        'y',
        'width',
        'height',
    ]);
    /**
     * get/set clip
     * @method
     * @name Konva.Container#clip
     * @param {Object} clip
     * @param {Number} clip.x
     * @param {Number} clip.y
     * @param {Number} clip.width
     * @param {Number} clip.height
     * @returns {Object}
     * @example
     * // get clip
     * var clip = container.clip();
     *
     * // set clip
     * container.clip({
     *   x: 20,
     *   y: 20,
     *   width: 20,
     *   height: 20
     * });
     */
    Factory.addGetterSetter(Container, 'clipX', undefined, getNumberValidator());
    /**
     * get/set clip x
     * @name Konva.Container#clipX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get clip x
     * var clipX = container.clipX();
     *
     * // set clip x
     * container.clipX(10);
     */
    Factory.addGetterSetter(Container, 'clipY', undefined, getNumberValidator());
    /**
     * get/set clip y
     * @name Konva.Container#clipY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get clip y
     * var clipY = container.clipY();
     *
     * // set clip y
     * container.clipY(10);
     */
    Factory.addGetterSetter(Container, 'clipWidth', undefined, getNumberValidator());
    /**
     * get/set clip width
     * @name Konva.Container#clipWidth
     * @method
     * @param {Number} width
     * @returns {Number}
     * @example
     * // get clip width
     * var clipWidth = container.clipWidth();
     *
     * // set clip width
     * container.clipWidth(100);
     */
    Factory.addGetterSetter(Container, 'clipHeight', undefined, getNumberValidator());
    /**
     * get/set clip height
     * @name Konva.Container#clipHeight
     * @method
     * @param {Number} height
     * @returns {Number}
     * @example
     * // get clip height
     * var clipHeight = container.clipHeight();
     *
     * // set clip height
     * container.clipHeight(100);
     */
    Factory.addGetterSetter(Container, 'clipFunc');
    /**
     * get/set clip function
     * @name Konva.Container#clipFunc
     * @method
     * @param {Function} function
     * @returns {Function}
     * @example
     * // get clip function
     * var clipFunction = container.clipFunc();
     *
     * // set clip height
     * container.clipFunc(function(ctx) {
     *   ctx.rect(0, 0, 100, 100);
     * });
     */
  
    const Captures = new Map();
    // we may use this module for capturing touch events too
    // so make sure we don't do something super specific to pointer
    const SUPPORT_POINTER_EVENTS = Konva$2._global['PointerEvent'] !== undefined;
    function getCapturedShape(pointerId) {
        return Captures.get(pointerId);
    }
    function createEvent(evt) {
        return {
            evt,
            pointerId: evt.pointerId,
        };
    }
    function hasPointerCapture(pointerId, shape) {
        return Captures.get(pointerId) === shape;
    }
    function setPointerCapture(pointerId, shape) {
        releaseCapture(pointerId);
        const stage = shape.getStage();
        if (!stage)
            return;
        Captures.set(pointerId, shape);
        if (SUPPORT_POINTER_EVENTS) {
            shape._fire('gotpointercapture', createEvent(new PointerEvent('gotpointercapture')));
        }
    }
    function releaseCapture(pointerId, target) {
        const shape = Captures.get(pointerId);
        if (!shape)
            return;
        const stage = shape.getStage();
        if (stage && stage.content) ;
        Captures.delete(pointerId);
        if (SUPPORT_POINTER_EVENTS) {
            shape._fire('lostpointercapture', createEvent(new PointerEvent('lostpointercapture')));
        }
    }
  
    // CONSTANTS
    var STAGE = 'Stage', STRING = 'string', PX = 'px', MOUSEOUT = 'mouseout', MOUSELEAVE = 'mouseleave', MOUSEOVER = 'mouseover', MOUSEENTER = 'mouseenter', MOUSEMOVE = 'mousemove', MOUSEDOWN = 'mousedown', MOUSEUP = 'mouseup', POINTERMOVE = 'pointermove', POINTERDOWN = 'pointerdown', POINTERUP = 'pointerup', POINTERCANCEL = 'pointercancel', LOSTPOINTERCAPTURE = 'lostpointercapture', POINTEROUT = 'pointerout', POINTERLEAVE = 'pointerleave', POINTEROVER = 'pointerover', POINTERENTER = 'pointerenter', CONTEXTMENU = 'contextmenu', TOUCHSTART = 'touchstart', TOUCHEND = 'touchend', TOUCHMOVE = 'touchmove', TOUCHCANCEL = 'touchcancel', WHEEL = 'wheel', MAX_LAYERS_NUMBER = 5, EVENTS = [
        [MOUSEENTER, '_pointerenter'],
        [MOUSEDOWN, '_pointerdown'],
        [MOUSEMOVE, '_pointermove'],
        [MOUSEUP, '_pointerup'],
        [MOUSELEAVE, '_pointerleave'],
        [TOUCHSTART, '_pointerdown'],
        [TOUCHMOVE, '_pointermove'],
        [TOUCHEND, '_pointerup'],
        [TOUCHCANCEL, '_pointercancel'],
        [MOUSEOVER, '_pointerover'],
        [WHEEL, '_wheel'],
        [CONTEXTMENU, '_contextmenu'],
        [POINTERDOWN, '_pointerdown'],
        [POINTERMOVE, '_pointermove'],
        [POINTERUP, '_pointerup'],
        [POINTERCANCEL, '_pointercancel'],
        [LOSTPOINTERCAPTURE, '_lostpointercapture'],
    ];
    const EVENTS_MAP = {
        mouse: {
            [POINTEROUT]: MOUSEOUT,
            [POINTERLEAVE]: MOUSELEAVE,
            [POINTEROVER]: MOUSEOVER,
            [POINTERENTER]: MOUSEENTER,
            [POINTERMOVE]: MOUSEMOVE,
            [POINTERDOWN]: MOUSEDOWN,
            [POINTERUP]: MOUSEUP,
            [POINTERCANCEL]: 'mousecancel',
            pointerclick: 'click',
            pointerdblclick: 'dblclick',
        },
        touch: {
            [POINTEROUT]: 'touchout',
            [POINTERLEAVE]: 'touchleave',
            [POINTEROVER]: 'touchover',
            [POINTERENTER]: 'touchenter',
            [POINTERMOVE]: TOUCHMOVE,
            [POINTERDOWN]: TOUCHSTART,
            [POINTERUP]: TOUCHEND,
            [POINTERCANCEL]: TOUCHCANCEL,
            pointerclick: 'tap',
            pointerdblclick: 'dbltap',
        },
        pointer: {
            [POINTEROUT]: POINTEROUT,
            [POINTERLEAVE]: POINTERLEAVE,
            [POINTEROVER]: POINTEROVER,
            [POINTERENTER]: POINTERENTER,
            [POINTERMOVE]: POINTERMOVE,
            [POINTERDOWN]: POINTERDOWN,
            [POINTERUP]: POINTERUP,
            [POINTERCANCEL]: POINTERCANCEL,
            pointerclick: 'pointerclick',
            pointerdblclick: 'pointerdblclick',
        },
    };
    const getEventType = (type) => {
        if (type.indexOf('pointer') >= 0) {
            return 'pointer';
        }
        if (type.indexOf('touch') >= 0) {
            return 'touch';
        }
        return 'mouse';
    };
    const getEventsMap = (eventType) => {
        const type = getEventType(eventType);
        if (type === 'pointer') {
            return Konva$2.pointerEventsEnabled && EVENTS_MAP.pointer;
        }
        if (type === 'touch') {
            return EVENTS_MAP.touch;
        }
        if (type === 'mouse') {
            return EVENTS_MAP.mouse;
        }
    };
    function checkNoClip(attrs = {}) {
        if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
            Util.warn('Stage does not support clipping. Please use clip for Layers or Groups.');
        }
        return attrs;
    }
    const NO_POINTERS_MESSAGE = `Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);`;
    const stages = [];
    /**
     * Stage constructor.  A stage is used to contain multiple layers
     * @constructor
     * @memberof Konva
     * @augments Konva.Container
     * @param {Object} config
     * @param {String|Element} config.container Container selector or DOM element
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var stage = new Konva.Stage({
     *   width: 500,
     *   height: 800,
     *   container: 'containerId' // or "#containerId" or ".containerClass"
     * });
     */
    class Stage extends Container {
        constructor(config) {
            super(checkNoClip(config));
            this._pointerPositions = [];
            this._changedPointerPositions = [];
            this._buildDOM();
            this._bindContentEvents();
            stages.push(this);
            this.on('widthChange.konva heightChange.konva', this._resizeDOM);
            this.on('visibleChange.konva', this._checkVisibility);
            this.on('clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva', () => {
                checkNoClip(this.attrs);
            });
            this._checkVisibility();
        }
        _validateAdd(child) {
            const isLayer = child.getType() === 'Layer';
            const isFastLayer = child.getType() === 'FastLayer';
            const valid = isLayer || isFastLayer;
            if (!valid) {
                Util.throw('You may only add layers to the stage.');
            }
        }
        _checkVisibility() {
            if (!this.content) {
                return;
            }
            const style = this.visible() ? '' : 'none';
            this.content.style.display = style;
        }
        /**
         * set container dom element which contains the stage wrapper div element
         * @method
         * @name Konva.Stage#setContainer
         * @param {DomElement} container can pass in a dom element or id string
         */
        setContainer(container) {
            if (typeof container === STRING) {
                if (container.charAt(0) === '.') {
                    var className = container.slice(1);
                    container = document.getElementsByClassName(className)[0];
                }
                else {
                    var id;
                    if (container.charAt(0) !== '#') {
                        id = container;
                    }
                    else {
                        id = container.slice(1);
                    }
                    container = document.getElementById(id);
                }
                if (!container) {
                    throw 'Can not find container in document with id ' + id;
                }
            }
            this._setAttr('container', container);
            if (this.content) {
                if (this.content.parentElement) {
                    this.content.parentElement.removeChild(this.content);
                }
                container.appendChild(this.content);
            }
            return this;
        }
        shouldDrawHit() {
            return true;
        }
        /**
         * clear all layers
         * @method
         * @name Konva.Stage#clear
         */
        clear() {
            var layers = this.children, len = layers.length, n;
            for (n = 0; n < len; n++) {
                layers[n].clear();
            }
            return this;
        }
        clone(obj) {
            if (!obj) {
                obj = {};
            }
            obj.container =
                typeof document !== 'undefined' && document.createElement('div');
            return Container.prototype.clone.call(this, obj);
        }
        destroy() {
            super.destroy();
            var content = this.content;
            if (content && Util._isInDocument(content)) {
                this.container().removeChild(content);
            }
            var index = stages.indexOf(this);
            if (index > -1) {
                stages.splice(index, 1);
            }
            return this;
        }
        /**
         * returns ABSOLUTE pointer position which can be a touch position or mouse position
         * pointer position doesn't include any transforms (such as scale) of the stage
         * it is just a plain position of pointer relative to top-left corner of the canvas
         * @method
         * @name Konva.Stage#getPointerPosition
         * @returns {Vector2d|null}
         */
        getPointerPosition() {
            const pos = this._pointerPositions[0] || this._changedPointerPositions[0];
            if (!pos) {
                Util.warn(NO_POINTERS_MESSAGE);
                return null;
            }
            return {
                x: pos.x,
                y: pos.y,
            };
        }
        _getPointerById(id) {
            return this._pointerPositions.find((p) => p.id === id);
        }
        getPointersPositions() {
            return this._pointerPositions;
        }
        getStage() {
            return this;
        }
        getContent() {
            return this.content;
        }
        _toKonvaCanvas(config) {
            config = config || {};
            config.x = config.x || 0;
            config.y = config.y || 0;
            config.width = config.width || this.width();
            config.height = config.height || this.height();
            var canvas = new SceneCanvas({
                width: config.width,
                height: config.height,
                pixelRatio: config.pixelRatio || 1,
            });
            var _context = canvas.getContext()._context;
            var layers = this.children;
            if (config.x || config.y) {
                _context.translate(-1 * config.x, -1 * config.y);
            }
            layers.forEach(function (layer) {
                if (!layer.isVisible()) {
                    return;
                }
                var layerCanvas = layer._toKonvaCanvas(config);
                _context.drawImage(layerCanvas._canvas, config.x, config.y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
            });
            return canvas;
        }
        /**
         * get visible intersection shape. This is the preferred
         *  method for determining if a point intersects a shape or not
         * @method
         * @name Konva.Stage#getIntersection
         * @param {Object} pos
         * @param {Number} pos.x
         * @param {Number} pos.y
         * @returns {Konva.Node}
         * @example
         * var shape = stage.getIntersection({x: 50, y: 50});
         */
        getIntersection(pos) {
            if (!pos) {
                return null;
            }
            var layers = this.children, len = layers.length, end = len - 1, n;
            for (n = end; n >= 0; n--) {
                const shape = layers[n].getIntersection(pos);
                if (shape) {
                    return shape;
                }
            }
            return null;
        }
        _resizeDOM() {
            var width = this.width();
            var height = this.height();
            if (this.content) {
                // set content dimensions
                this.content.style.width = width + PX;
                this.content.style.height = height + PX;
            }
            this.bufferCanvas.setSize(width, height);
            this.bufferHitCanvas.setSize(width, height);
            // set layer dimensions
            this.children.forEach((layer) => {
                layer.setSize({ width, height });
                layer.draw();
            });
        }
        add(layer, ...rest) {
            if (arguments.length > 1) {
                for (var i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            super.add(layer);
            var length = this.children.length;
            if (length > MAX_LAYERS_NUMBER) {
                Util.warn('The stage has ' +
                    length +
                    ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.');
            }
            layer.setSize({ width: this.width(), height: this.height() });
            // draw layer and append canvas to container
            layer.draw();
            if (Konva$2.isBrowser) {
                this.content.appendChild(layer.canvas._canvas);
            }
            // chainable
            return this;
        }
        getParent() {
            return null;
        }
        getLayer() {
            return null;
        }
        hasPointerCapture(pointerId) {
            return hasPointerCapture(pointerId, this);
        }
        setPointerCapture(pointerId) {
            setPointerCapture(pointerId, this);
        }
        releaseCapture(pointerId) {
            releaseCapture(pointerId);
        }
        /**
         * returns an array of layers
         * @method
         * @name Konva.Stage#getLayers
         */
        getLayers() {
            return this.children;
        }
        _bindContentEvents() {
            if (!Konva$2.isBrowser) {
                return;
            }
            EVENTS.forEach(([event, methodName]) => {
                this.content.addEventListener(event, (evt) => {
                    this[methodName](evt);
                });
            });
        }
        _pointerenter(evt) {
            this.setPointersPositions(evt);
            const events = getEventsMap(evt.type);
            this._fire(events.pointerenter, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
        _pointerover(evt) {
            this.setPointersPositions(evt);
            const events = getEventsMap(evt.type);
            this._fire(events.pointerover, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
        _getTargetShape(evenType) {
            let shape = this[evenType + 'targetShape'];
            if (shape && !shape.getStage()) {
                shape = null;
            }
            return shape;
        }
        _pointerleave(evt) {
            const events = getEventsMap(evt.type);
            const eventType = getEventType(evt.type);
            if (!events) {
                return;
            }
            this.setPointersPositions(evt);
            var targetShape = this._getTargetShape(eventType);
            var eventsEnabled = !DD.isDragging || Konva$2.hitOnDragEnabled;
            if (targetShape && eventsEnabled) {
                targetShape._fireAndBubble(events.pointerout, { evt: evt });
                targetShape._fireAndBubble(events.pointerleave, { evt: evt });
                this._fire(events.pointerleave, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                });
                this[eventType + 'targetShape'] = null;
            }
            else if (eventsEnabled) {
                this._fire(events.pointerleave, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                });
                this._fire(events.pointerout, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                });
            }
            this.pointerPos = undefined;
            this._pointerPositions = [];
        }
        _pointerdown(evt) {
            const events = getEventsMap(evt.type);
            const eventType = getEventType(evt.type);
            if (!events) {
                return;
            }
            this.setPointersPositions(evt);
            var triggeredOnShape = false;
            this._changedPointerPositions.forEach((pos) => {
                var shape = this.getIntersection(pos);
                DD.justDragged = false;
                // probably we are staring a click
                Konva$2['_' + eventType + 'ListenClick'] = true;
                // no shape detected? do nothing
                const hasShape = shape && shape.isListening();
                if (!hasShape) {
                    return;
                }
                if (Konva$2.capturePointerEventsEnabled) {
                    shape.setPointerCapture(pos.id);
                }
                // save where we started the click
                this[eventType + 'ClickStartShape'] = shape;
                shape._fireAndBubble(events.pointerdown, {
                    evt: evt,
                    pointerId: pos.id,
                });
                triggeredOnShape = true;
                // TODO: test in iframe
                // only call preventDefault if the shape is listening for events
                const isTouch = evt.type.indexOf('touch') >= 0;
                if (shape.preventDefault() && evt.cancelable && isTouch) {
                    evt.preventDefault();
                }
            });
            // trigger down on stage if not already
            if (!triggeredOnShape) {
                this._fire(events.pointerdown, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: this._pointerPositions[0].id,
                });
            }
        }
        _pointermove(evt) {
            const events = getEventsMap(evt.type);
            const eventType = getEventType(evt.type);
            if (!events) {
                return;
            }
            if (DD.isDragging && DD.node.preventDefault() && evt.cancelable) {
                evt.preventDefault();
            }
            this.setPointersPositions(evt);
            var eventsEnabled = !DD.isDragging || Konva$2.hitOnDragEnabled;
            if (!eventsEnabled) {
                return;
            }
            var processedShapesIds = {};
            let triggeredOnShape = false;
            var targetShape = this._getTargetShape(eventType);
            this._changedPointerPositions.forEach((pos) => {
                const shape = (getCapturedShape(pos.id) ||
                    this.getIntersection(pos));
                const pointerId = pos.id;
                const event = { evt: evt, pointerId };
                var differentTarget = targetShape !== shape;
                if (differentTarget && targetShape) {
                    targetShape._fireAndBubble(events.pointerout, Object.assign({}, event), shape);
                    targetShape._fireAndBubble(events.pointerleave, Object.assign({}, event), shape);
                }
                if (shape) {
                    if (processedShapesIds[shape._id]) {
                        return;
                    }
                    processedShapesIds[shape._id] = true;
                }
                if (shape && shape.isListening()) {
                    triggeredOnShape = true;
                    if (differentTarget) {
                        shape._fireAndBubble(events.pointerover, Object.assign({}, event), targetShape);
                        shape._fireAndBubble(events.pointerenter, Object.assign({}, event), targetShape);
                        this[eventType + 'targetShape'] = shape;
                    }
                    shape._fireAndBubble(events.pointermove, Object.assign({}, event));
                }
                else {
                    if (targetShape) {
                        this._fire(events.pointerover, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId,
                        });
                        this[eventType + 'targetShape'] = null;
                    }
                }
            });
            if (!triggeredOnShape) {
                this._fire(events.pointermove, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: this._changedPointerPositions[0].id,
                });
            }
        }
        _pointerup(evt) {
            const events = getEventsMap(evt.type);
            const eventType = getEventType(evt.type);
            if (!events) {
                return;
            }
            this.setPointersPositions(evt);
            const clickStartShape = this[eventType + 'ClickStartShape'];
            const clickEndShape = this[eventType + 'ClickEndShape'];
            var processedShapesIds = {};
            let triggeredOnShape = false;
            this._changedPointerPositions.forEach((pos) => {
                const shape = (getCapturedShape(pos.id) ||
                    this.getIntersection(pos));
                if (shape) {
                    shape.releaseCapture(pos.id);
                    if (processedShapesIds[shape._id]) {
                        return;
                    }
                    processedShapesIds[shape._id] = true;
                }
                const pointerId = pos.id;
                const event = { evt: evt, pointerId };
                let fireDblClick = false;
                if (Konva$2['_' + eventType + 'InDblClickWindow']) {
                    fireDblClick = true;
                    clearTimeout(this[eventType + 'DblTimeout']);
                }
                else if (!DD.justDragged) {
                    // don't set inDblClickWindow after dragging
                    Konva$2['_' + eventType + 'InDblClickWindow'] = true;
                    clearTimeout(this[eventType + 'DblTimeout']);
                }
                this[eventType + 'DblTimeout'] = setTimeout(function () {
                    Konva$2['_' + eventType + 'InDblClickWindow'] = false;
                }, Konva$2.dblClickWindow);
                if (shape && shape.isListening()) {
                    triggeredOnShape = true;
                    this[eventType + 'ClickEndShape'] = shape;
                    shape._fireAndBubble(events.pointerup, Object.assign({}, event));
                    // detect if click or double click occurred
                    if (Konva$2['_' + eventType + 'ListenClick'] &&
                        clickStartShape &&
                        clickStartShape === shape) {
                        shape._fireAndBubble(events.pointerclick, Object.assign({}, event));
                        if (fireDblClick && clickEndShape && clickEndShape === shape) {
                            shape._fireAndBubble(events.pointerdblclick, Object.assign({}, event));
                        }
                    }
                }
                else {
                    this[eventType + 'ClickEndShape'] = null;
                    if (Konva$2['_' + eventType + 'ListenClick']) {
                        this._fire(events.pointerclick, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId,
                        });
                    }
                    if (fireDblClick) {
                        this._fire(events.pointerdblclick, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId,
                        });
                    }
                }
            });
            if (!triggeredOnShape) {
                this._fire(events.pointerup, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: this._changedPointerPositions[0].id,
                });
            }
            Konva$2['_' + eventType + 'ListenClick'] = false;
            // always call preventDefault for desktop events because some browsers
            // try to drag and drop the canvas element
            if (evt.cancelable) {
                evt.preventDefault();
            }
        }
        _contextmenu(evt) {
            this.setPointersPositions(evt);
            var shape = this.getIntersection(this.getPointerPosition());
            if (shape && shape.isListening()) {
                shape._fireAndBubble(CONTEXTMENU, { evt: evt });
            }
            else {
                this._fire(CONTEXTMENU, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                });
            }
        }
        _wheel(evt) {
            this.setPointersPositions(evt);
            var shape = this.getIntersection(this.getPointerPosition());
            if (shape && shape.isListening()) {
                shape._fireAndBubble(WHEEL, { evt: evt });
            }
            else {
                this._fire(WHEEL, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                });
            }
        }
        _pointercancel(evt) {
            this.setPointersPositions(evt);
            const shape = getCapturedShape(evt.pointerId) ||
                this.getIntersection(this.getPointerPosition());
            if (shape) {
                shape._fireAndBubble(POINTERUP, createEvent(evt));
            }
            releaseCapture(evt.pointerId);
        }
        _lostpointercapture(evt) {
            releaseCapture(evt.pointerId);
        }
        /**
         * manually register pointers positions (mouse/touch) in the stage.
         * So you can use stage.getPointerPosition(). Usually you don't need to use that method
         * because all internal events are automatically registered. It may be useful if event
         * is triggered outside of the stage, but you still want to use Konva methods to get pointers position.
         * @method
         * @name Konva.Stage#setPointersPositions
         * @param {Object} event Event object
         * @example
         *
         * window.addEventListener('mousemove', (e) => {
         *   stage.setPointersPositions(e);
         * });
         */
        setPointersPositions(evt) {
            var contentPosition = this._getContentPosition(), x = null, y = null;
            evt = evt ? evt : window.event;
            // touch events
            if (evt.touches !== undefined) {
                // touchlist has not support for map method
                // so we have to iterate
                this._pointerPositions = [];
                this._changedPointerPositions = [];
                Array.prototype.forEach.call(evt.touches, (touch) => {
                    this._pointerPositions.push({
                        id: touch.identifier,
                        x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                        y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                    });
                });
                Array.prototype.forEach.call(evt.changedTouches || evt.touches, (touch) => {
                    this._changedPointerPositions.push({
                        id: touch.identifier,
                        x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                        y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                    });
                });
            }
            else {
                // mouse events
                x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
                y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
                this.pointerPos = {
                    x: x,
                    y: y,
                };
                this._pointerPositions = [{ x, y, id: Util._getFirstPointerId(evt) }];
                this._changedPointerPositions = [
                    { x, y, id: Util._getFirstPointerId(evt) },
                ];
            }
        }
        _setPointerPosition(evt) {
            Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
            this.setPointersPositions(evt);
        }
        _getContentPosition() {
            if (!this.content || !this.content.getBoundingClientRect) {
                return {
                    top: 0,
                    left: 0,
                    scaleX: 1,
                    scaleY: 1,
                };
            }
            var rect = this.content.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left,
                // sometimes clientWidth can be equals to 0
                // i saw it in react-konva test, looks like it is because of hidden testing element
                scaleX: rect.width / this.content.clientWidth || 1,
                scaleY: rect.height / this.content.clientHeight || 1,
            };
        }
        _buildDOM() {
            this.bufferCanvas = new SceneCanvas({
                width: this.width(),
                height: this.height(),
            });
            this.bufferHitCanvas = new HitCanvas({
                pixelRatio: 1,
                width: this.width(),
                height: this.height(),
            });
            if (!Konva$2.isBrowser) {
                return;
            }
            var container = this.container();
            if (!container) {
                throw 'Stage has no container. A container is required.';
            }
            // clear content inside container
            container.innerHTML = '';
            // content
            this.content = document.createElement('div');
            this.content.style.position = 'relative';
            this.content.style.userSelect = 'none';
            this.content.className = 'konvajs-content';
            this.content.setAttribute('role', 'presentation');
            container.appendChild(this.content);
            this._resizeDOM();
        }
        // currently cache function is now working for stage, because stage has no its own canvas element
        cache() {
            Util.warn('Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.');
            return this;
        }
        clearCache() {
            return this;
        }
        /**
         * batch draw
         * @method
         * @name Konva.Stage#batchDraw
         * @return {Konva.Stage} this
         */
        batchDraw() {
            this.getChildren().forEach(function (layer) {
                layer.batchDraw();
            });
            return this;
        }
    }
    Stage.prototype.nodeType = STAGE;
    _registerNode(Stage);
    /**
     * get/set container DOM element
     * @method
     * @name Konva.Stage#container
     * @returns {DomElement} container
     * @example
     * // get container
     * var container = stage.container();
     * // set container
     * var container = document.createElement('div');
     * body.appendChild(container);
     * stage.container(container);
     */
    Factory.addGetterSetter(Stage, 'container');
  
    var HAS_SHADOW = 'hasShadow';
    var SHADOW_RGBA = 'shadowRGBA';
    var patternImage = 'patternImage';
    var linearGradient = 'linearGradient';
    var radialGradient = 'radialGradient';
    let dummyContext$1;
    function getDummyContext$1() {
        if (dummyContext$1) {
            return dummyContext$1;
        }
        dummyContext$1 = Util.createCanvasElement().getContext('2d');
        return dummyContext$1;
    }
    const shapes = {};
    // TODO: idea - use only "remove" (or destroy method)
    // how? on add, check that every inner shape has reference in konva store with color
    // on remove - clear that reference
    // the approach is good. But what if we want to cache the shape before we add it into the stage
    // what color to use for hit test?
    function _fillFunc$2(context) {
        context.fill();
    }
    function _strokeFunc$2(context) {
        context.stroke();
    }
    function _fillFuncHit(context) {
        context.fill();
    }
    function _strokeFuncHit(context) {
        context.stroke();
    }
    function _clearHasShadowCache() {
        this._clearCache(HAS_SHADOW);
    }
    function _clearGetShadowRGBACache() {
        this._clearCache(SHADOW_RGBA);
    }
    function _clearFillPatternCache() {
        this._clearCache(patternImage);
    }
    function _clearLinearGradientCache() {
        this._clearCache(linearGradient);
    }
    function _clearRadialGradientCache() {
        this._clearCache(radialGradient);
    }
    /**
     * Shape constructor.  Shapes are primitive objects such as rectangles,
     *  circles, text, lines, etc.
     * @constructor
     * @memberof Konva
     * @augments Konva.Node
     * @param {Object} config
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var customShape = new Konva.Shape({
     *   x: 5,
     *   y: 10,
     *   fill: 'red',
     *   // a Konva.Canvas renderer is passed into the sceneFunc function
     *   sceneFunc (context, shape) {
     *     context.beginPath();
     *     context.moveTo(200, 50);
     *     context.lineTo(420, 80);
     *     context.quadraticCurveTo(300, 100, 260, 170);
     *     context.closePath();
     *     // Konva specific method
     *     context.fillStrokeShape(shape);
     *   }
     *});
     */
    class Shape extends Node {
        constructor(config) {
            super(config);
            // set colorKey
            let key;
            while (true) {
                key = Util.getRandomColor();
                if (key && !(key in shapes)) {
                    break;
                }
            }
            this.colorKey = key;
            shapes[key] = this;
        }
        getContext() {
            Util.warn('shape.getContext() method is deprecated. Please do not use it.');
            return this.getLayer().getContext();
        }
        getCanvas() {
            Util.warn('shape.getCanvas() method is deprecated. Please do not use it.');
            return this.getLayer().getCanvas();
        }
        getSceneFunc() {
            return this.attrs.sceneFunc || this['_sceneFunc'];
        }
        getHitFunc() {
            return this.attrs.hitFunc || this['_hitFunc'];
        }
        /**
         * returns whether or not a shadow will be rendered
         * @method
         * @name Konva.Shape#hasShadow
         * @returns {Boolean}
         */
        hasShadow() {
            return this._getCache(HAS_SHADOW, this._hasShadow);
        }
        _hasShadow() {
            return (this.shadowEnabled() &&
                this.shadowOpacity() !== 0 &&
                !!(this.shadowColor() ||
                    this.shadowBlur() ||
                    this.shadowOffsetX() ||
                    this.shadowOffsetY()));
        }
        _getFillPattern() {
            return this._getCache(patternImage, this.__getFillPattern);
        }
        __getFillPattern() {
            if (this.fillPatternImage()) {
                var ctx = getDummyContext$1();
                const pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || 'repeat');
                if (pattern && pattern.setTransform) {
                    const tr = new Transform();
                    tr.translate(this.fillPatternX(), this.fillPatternY());
                    tr.rotate(Konva$2.getAngle(this.fillPatternRotation()));
                    tr.scale(this.fillPatternScaleX(), this.fillPatternScaleY());
                    tr.translate(-1 * this.fillPatternOffsetX(), -1 * this.fillPatternOffsetY());
                    const m = tr.getMatrix();
                    pattern.setTransform({
                        a: m[0],
                        b: m[1],
                        c: m[2],
                        d: m[3],
                        e: m[4],
                        f: m[5], // Vertical translation (moving).
                    });
                }
                return pattern;
            }
        }
        _getLinearGradient() {
            return this._getCache(linearGradient, this.__getLinearGradient);
        }
        __getLinearGradient() {
            var colorStops = this.fillLinearGradientColorStops();
            if (colorStops) {
                var ctx = getDummyContext$1();
                var start = this.fillLinearGradientStartPoint();
                var end = this.fillLinearGradientEndPoint();
                var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                // build color stops
                for (var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                return grd;
            }
        }
        _getRadialGradient() {
            return this._getCache(radialGradient, this.__getRadialGradient);
        }
        __getRadialGradient() {
            var colorStops = this.fillRadialGradientColorStops();
            if (colorStops) {
                var ctx = getDummyContext$1();
                var start = this.fillRadialGradientStartPoint();
                var end = this.fillRadialGradientEndPoint();
                var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
                // build color stops
                for (var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                return grd;
            }
        }
        getShadowRGBA() {
            return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
        }
        _getShadowRGBA() {
            if (this.hasShadow()) {
                var rgba = Util.colorToRGBA(this.shadowColor());
                return ('rgba(' +
                    rgba.r +
                    ',' +
                    rgba.g +
                    ',' +
                    rgba.b +
                    ',' +
                    rgba.a * (this.shadowOpacity() || 1) +
                    ')');
            }
        }
        /**
         * returns whether or not the shape will be filled
         * @method
         * @name Konva.Shape#hasFill
         * @returns {Boolean}
         */
        hasFill() {
            return this._calculate('hasFill', [
                'fillEnabled',
                'fill',
                'fillPatternImage',
                'fillLinearGradientColorStops',
                'fillRadialGradientColorStops',
            ], () => {
                return (this.fillEnabled() &&
                    !!(this.fill() ||
                        this.fillPatternImage() ||
                        this.fillLinearGradientColorStops() ||
                        this.fillRadialGradientColorStops()));
            });
        }
        /**
         * returns whether or not the shape will be stroked
         * @method
         * @name Konva.Shape#hasStroke
         * @returns {Boolean}
         */
        hasStroke() {
            return this._calculate('hasStroke', [
                'strokeEnabled',
                'strokeWidth',
                'stroke',
                'strokeLinearGradientColorStops',
            ], () => {
                return (this.strokeEnabled() &&
                    this.strokeWidth() &&
                    !!(this.stroke() || this.strokeLinearGradientColorStops())
                // this.getStrokeRadialGradientColorStops()
                );
            });
            // return (
            //   this.strokeEnabled() &&
            //   this.strokeWidth() &&
            //   !!(this.stroke() || this.strokeLinearGradientColorStops())
            //   // this.getStrokeRadialGradientColorStops()
            // );
        }
        hasHitStroke() {
            const width = this.hitStrokeWidth();
            // on auto just check by stroke
            if (width === 'auto') {
                return this.hasStroke();
            }
            // we should enable hit stroke if stroke is enabled
            // and we have some value from width
            return this.strokeEnabled() && !!width;
        }
        /**
         * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
         *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
         *  consecutively.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
         *  because it performs much better
         * @method
         * @name Konva.Shape#intersects
         * @param {Object} point
         * @param {Number} point.x
         * @param {Number} point.y
         * @returns {Boolean}
         */
        intersects(point) {
            var stage = this.getStage(), bufferHitCanvas = stage.bufferHitCanvas, p;
            bufferHitCanvas.getContext().clear();
            this.drawHit(bufferHitCanvas, null, true);
            p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
            return p[3] > 0;
        }
        destroy() {
            Node.prototype.destroy.call(this);
            delete shapes[this.colorKey];
            delete this.colorKey;
            return this;
        }
        // why do we need buffer canvas?
        // it give better result when a shape has
        // stroke with fill and with some opacity
        _useBufferCanvas(forceFill) {
            // image and sprite still has "fill" as image
            // so they use that method with forced fill
            // it probably will be simpler, then copy/paste the code
            var _a;
            // buffer canvas is available only inside the stage
            if (!this.getStage()) {
                return false;
            }
            // force skip buffer canvas
            const perfectDrawEnabled = (_a = this.attrs.perfectDrawEnabled) !== null && _a !== void 0 ? _a : true;
            if (!perfectDrawEnabled) {
                return false;
            }
            const hasFill = forceFill || this.hasFill();
            const hasStroke = this.hasStroke();
            const isTransparent = this.getAbsoluteOpacity() !== 1;
            if (hasFill && hasStroke && isTransparent) {
                return true;
            }
            const hasShadow = this.hasShadow();
            const strokeForShadow = this.shadowForStrokeEnabled();
            if (hasFill && hasStroke && hasShadow && strokeForShadow) {
                return true;
            }
            return false;
        }
        setStrokeHitEnabled(val) {
            Util.warn('strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.');
            if (val) {
                this.hitStrokeWidth('auto');
            }
            else {
                this.hitStrokeWidth(0);
            }
        }
        getStrokeHitEnabled() {
            if (this.hitStrokeWidth() === 0) {
                return false;
            }
            else {
                return true;
            }
        }
        /**
         * return self rectangle (x, y, width, height) of shape.
         * This method are not taken into account transformation and styles.
         * @method
         * @name Konva.Shape#getSelfRect
         * @returns {Object} rect with {x, y, width, height} properties
         * @example
         *
         * rect.getSelfRect();  // return {x:0, y:0, width:rect.width(), height:rect.height()}
         * circle.getSelfRect();  // return {x: - circle.width() / 2, y: - circle.height() / 2, width:circle.width(), height:circle.height()}
         *
         */
        getSelfRect() {
            var size = this.size();
            return {
                x: this._centroid ? -size.width / 2 : 0,
                y: this._centroid ? -size.height / 2 : 0,
                width: size.width,
                height: size.height,
            };
        }
        getClientRect(config = {}) {
            const skipTransform = config.skipTransform;
            const relativeTo = config.relativeTo;
            const fillRect = this.getSelfRect();
            const applyStroke = !config.skipStroke && this.hasStroke();
            const strokeWidth = (applyStroke && this.strokeWidth()) || 0;
            const fillAndStrokeWidth = fillRect.width + strokeWidth;
            const fillAndStrokeHeight = fillRect.height + strokeWidth;
            const applyShadow = !config.skipShadow && this.hasShadow();
            const shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
            const shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
            const preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
            const preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
            const blurRadius = (applyShadow && this.shadowBlur()) || 0;
            const width = preWidth + blurRadius * 2;
            const height = preHeight + blurRadius * 2;
            // if stroke, for example = 3
            // we need to set x to 1.5, but after Math.round it will be 2
            // as we have additional offset we need to increase width and height by 1 pixel
            let roundingOffset = 0;
            if (Math.round(strokeWidth / 2) !== strokeWidth / 2) {
                roundingOffset = 1;
            }
            const rect = {
                width: width + roundingOffset,
                height: height + roundingOffset,
                x: -Math.round(strokeWidth / 2 + blurRadius) +
                    Math.min(shadowOffsetX, 0) +
                    fillRect.x,
                y: -Math.round(strokeWidth / 2 + blurRadius) +
                    Math.min(shadowOffsetY, 0) +
                    fillRect.y,
            };
            if (!skipTransform) {
                return this._transformedRect(rect, relativeTo);
            }
            return rect;
        }
        drawScene(can, top) {
            // basically there are 3 drawing modes
            // 1 - simple drawing when nothing is cached.
            // 2 - when we are caching current
            // 3 - when node is cached and we need to draw it into layer
            var layer = this.getLayer(), canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.getSceneFunc(), hasShadow = this.hasShadow(), stage, bufferCanvas, bufferContext;
            var skipBuffer = canvas.isCache;
            var cachingSelf = top === this;
            if (!this.isVisible() && !cachingSelf) {
                return this;
            }
            // if node is cached we just need to draw from cache
            if (cachedCanvas) {
                context.save();
                var m = this.getAbsoluteTransform(top).getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                this._drawCachedSceneCanvas(context);
                context.restore();
                return this;
            }
            if (!drawFunc) {
                return this;
            }
            context.save();
            // if buffer canvas is needed
            if (this._useBufferCanvas() && !skipBuffer) {
                stage = this.getStage();
                bufferCanvas = stage.bufferCanvas;
                bufferContext = bufferCanvas.getContext();
                bufferContext.clear();
                bufferContext.save();
                bufferContext._applyLineJoin(this);
                // layer might be undefined if we are using cache before adding to layer
                var o = this.getAbsoluteTransform(top).getMatrix();
                bufferContext.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                drawFunc.call(this, bufferContext, this);
                bufferContext.restore();
                var ratio = bufferCanvas.pixelRatio;
                if (hasShadow) {
                    context._applyShadow(this);
                }
                context._applyOpacity(this);
                context._applyGlobalCompositeOperation(this);
                context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
            }
            else {
                context._applyLineJoin(this);
                if (!cachingSelf) {
                    var o = this.getAbsoluteTransform(top).getMatrix();
                    context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                }
                if (hasShadow) {
                    context._applyShadow(this);
                }
                drawFunc.call(this, context, this);
            }
            context.restore();
            return this;
        }
        drawHit(can, top, skipDragCheck = false) {
            if (!this.shouldDrawHit(top, skipDragCheck)) {
                return this;
            }
            var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
            if (!this.colorKey) {
                Util.warn('Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()');
            }
            if (cachedHitCanvas) {
                context.save();
                var m = this.getAbsoluteTransform(top).getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                this._drawCachedHitCanvas(context);
                context.restore();
                return this;
            }
            if (!drawFunc) {
                return this;
            }
            context.save();
            context._applyLineJoin(this);
            const selfCache = this === top;
            if (!selfCache) {
                var o = this.getAbsoluteTransform(top).getMatrix();
                context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
            }
            drawFunc.call(this, context, this);
            context.restore();
            return this;
        }
        /**
         * draw hit graph using the cached scene canvas
         * @method
         * @name Konva.Shape#drawHitFromCache
         * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
         *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.
         *  The default is 0
         * @returns {Konva.Shape}
         * @example
         * shape.cache();
         * shape.drawHitFromCache();
         */
        drawHitFromCache(alphaThreshold = 0) {
            var cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight(), hitImageData, hitData, len, rgbColorKey, i, alpha;
            hitContext.clear();
            hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
            try {
                hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
                hitData = hitImageData.data;
                len = hitData.length;
                rgbColorKey = Util._hexToRgb(this.colorKey);
                // replace non transparent pixels with color key
                for (i = 0; i < len; i += 4) {
                    alpha = hitData[i + 3];
                    if (alpha > alphaThreshold) {
                        hitData[i] = rgbColorKey.r;
                        hitData[i + 1] = rgbColorKey.g;
                        hitData[i + 2] = rgbColorKey.b;
                        hitData[i + 3] = 255;
                    }
                    else {
                        hitData[i + 3] = 0;
                    }
                }
                hitContext.putImageData(hitImageData, 0, 0);
            }
            catch (e) {
                Util.error('Unable to draw hit graph from cached scene canvas. ' + e.message);
            }
            return this;
        }
        hasPointerCapture(pointerId) {
            return hasPointerCapture(pointerId, this);
        }
        setPointerCapture(pointerId) {
            setPointerCapture(pointerId, this);
        }
        releaseCapture(pointerId) {
            releaseCapture(pointerId);
        }
    }
    Shape.prototype._fillFunc = _fillFunc$2;
    Shape.prototype._strokeFunc = _strokeFunc$2;
    Shape.prototype._fillFuncHit = _fillFuncHit;
    Shape.prototype._strokeFuncHit = _strokeFuncHit;
    Shape.prototype._centroid = false;
    Shape.prototype.nodeType = 'Shape';
    _registerNode(Shape);
    Shape.prototype.eventListeners = {};
    Shape.prototype.on.call(Shape.prototype, 'shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearHasShadowCache);
    Shape.prototype.on.call(Shape.prototype, 'shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearGetShadowRGBACache);
    Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva', _clearFillPatternCache);
    Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva', _clearLinearGradientCache);
    Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva', _clearRadialGradientCache);
    // add getters and setters
    Factory.addGetterSetter(Shape, 'stroke', undefined, getStringOrGradientValidator());
    /**
     * get/set stroke color
     * @name Konva.Shape#stroke
     * @method
     * @param {String} color
     * @returns {String}
     * @example
     * // get stroke color
     * var stroke = shape.stroke();
     *
     * // set stroke color with color string
     * shape.stroke('green');
     *
     * // set stroke color with hex
     * shape.stroke('#00ff00');
     *
     * // set stroke color with rgb
     * shape.stroke('rgb(0,255,0)');
     *
     * // set stroke color with rgba and make it 50% opaque
     * shape.stroke('rgba(0,255,0,0.5');
     */
    Factory.addGetterSetter(Shape, 'strokeWidth', 2, getNumberValidator());
    /**
     * get/set stroke width
     * @name Konva.Shape#strokeWidth
     * @method
     * @param {Number} strokeWidth
     * @returns {Number}
     * @example
     * // get stroke width
     * var strokeWidth = shape.strokeWidth();
     *
     * // set stroke width
     * shape.strokeWidth(10);
     */
    Factory.addGetterSetter(Shape, 'fillAfterStrokeEnabled', false);
    /**
     * get/set fillAfterStrokeEnabled property. By default Konva is drawing filling first, then stroke on top of the fill.
     * In rare situations you may want a different behavior. When you have a stroke first then fill on top of it.
     * Especially useful for Text objects.
     * Default is false.
     * @name Konva.Shape#fillAfterStrokeEnabled
     * @method
     * @param {Boolean} fillAfterStrokeEnabled
     * @returns {Boolean}
     * @example
     * // get stroke width
     * var fillAfterStrokeEnabled = shape.fillAfterStrokeEnabled();
     *
     * // set stroke width
     * shape.fillAfterStrokeEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'hitStrokeWidth', 'auto', getNumberOrAutoValidator());
    /**
     * get/set stroke width for hit detection. Default value is "auto", it means it will be equals to strokeWidth
     * @name Konva.Shape#hitStrokeWidth
     * @method
     * @param {Number} hitStrokeWidth
     * @returns {Number}
     * @example
     * // get stroke width
     * var hitStrokeWidth = shape.hitStrokeWidth();
     *
     * // set hit stroke width
     * shape.hitStrokeWidth(20);
     * // set hit stroke width always equals to scene stroke width
     * shape.hitStrokeWidth('auto');
     */
    Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, getBooleanValidator());
    /**
     * **deprecated, use hitStrokeWidth instead!** get/set strokeHitEnabled property. Useful for performance optimization.
     * You may set `shape.strokeHitEnabled(false)`. In this case stroke will be no draw on hit canvas, so hit area
     * of shape will be decreased (by lineWidth / 2). Remember that non closed line with `strokeHitEnabled = false`
     * will be not drawn on hit canvas, that is mean line will no trigger pointer events (like mouseover)
     * Default value is true.
     * @name Konva.Shape#strokeHitEnabled
     * @method
     * @param {Boolean} strokeHitEnabled
     * @returns {Boolean}
     * @example
     * // get strokeHitEnabled
     * var strokeHitEnabled = shape.strokeHitEnabled();
     *
     * // set strokeHitEnabled
     * shape.strokeHitEnabled();
     */
    Factory.addGetterSetter(Shape, 'perfectDrawEnabled', true, getBooleanValidator());
    /**
     * get/set perfectDrawEnabled. If a shape has fill, stroke and opacity you may set `perfectDrawEnabled` to false to improve performance.
     * See http://konvajs.org/docs/performance/Disable_Perfect_Draw.html for more information.
     * Default value is true
     * @name Konva.Shape#perfectDrawEnabled
     * @method
     * @param {Boolean} perfectDrawEnabled
     * @returns {Boolean}
     * @example
     * // get perfectDrawEnabled
     * var perfectDrawEnabled = shape.perfectDrawEnabled();
     *
     * // set perfectDrawEnabled
     * shape.perfectDrawEnabled();
     */
    Factory.addGetterSetter(Shape, 'shadowForStrokeEnabled', true, getBooleanValidator());
    /**
     * get/set shadowForStrokeEnabled. Useful for performance optimization.
     * You may set `shape.shadowForStrokeEnabled(false)`. In this case stroke will no effect shadow.
     * Remember if you set `shadowForStrokeEnabled = false` for non closed line - that line will have no shadow!.
     * Default value is true
     * @name Konva.Shape#shadowForStrokeEnabled
     * @method
     * @param {Boolean} shadowForStrokeEnabled
     * @returns {Boolean}
     * @example
     * // get shadowForStrokeEnabled
     * var shadowForStrokeEnabled = shape.shadowForStrokeEnabled();
     *
     * // set shadowForStrokeEnabled
     * shape.shadowForStrokeEnabled();
     */
    Factory.addGetterSetter(Shape, 'lineJoin');
    /**
     * get/set line join.  Can be miter, round, or bevel.  The
     *  default is miter
     * @name Konva.Shape#lineJoin
     * @method
     * @param {String} lineJoin
     * @returns {String}
     * @example
     * // get line join
     * var lineJoin = shape.lineJoin();
     *
     * // set line join
     * shape.lineJoin('round');
     */
    Factory.addGetterSetter(Shape, 'lineCap');
    /**
     * get/set line cap.  Can be butt, round, or square
     * @name Konva.Shape#lineCap
     * @method
     * @param {String} lineCap
     * @returns {String}
     * @example
     * // get line cap
     * var lineCap = shape.lineCap();
     *
     * // set line cap
     * shape.lineCap('round');
     */
    Factory.addGetterSetter(Shape, 'sceneFunc');
    /**
     * get/set scene draw function. That function is used to draw the shape on a canvas.
     * Also that function will be used to draw hit area of the shape, in case if hitFunc is not defined.
     * @name Konva.Shape#sceneFunc
     * @method
     * @param {Function} drawFunc drawing function
     * @returns {Function}
     * @example
     * // get scene draw function
     * var sceneFunc = shape.sceneFunc();
     *
     * // set scene draw function
     * shape.sceneFunc(function(context, shape) {
     *   context.beginPath();
     *   context.rect(0, 0, shape.width(), shape.height());
     *   context.closePath();
     *   // important Konva method that fill and stroke shape from its properties
     *   // like stroke and fill
     *   context.fillStrokeShape(shape);
     * });
     */
    Factory.addGetterSetter(Shape, 'hitFunc');
    /**
     * get/set hit draw function. That function is used to draw custom hit area of a shape.
     * @name Konva.Shape#hitFunc
     * @method
     * @param {Function} drawFunc drawing function
     * @returns {Function}
     * @example
     * // get hit draw function
     * var hitFunc = shape.hitFunc();
     *
     * // set hit draw function
     * shape.hitFunc(function(context) {
     *   context.beginPath();
     *   context.rect(0, 0, shape.width(), shape.height());
     *   context.closePath();
     *   // important Konva method that fill and stroke shape from its properties
     *   context.fillStrokeShape(shape);
     * });
     */
    Factory.addGetterSetter(Shape, 'dash');
    /**
     * get/set dash array for stroke.
     * @name Konva.Shape#dash
     * @method
     * @param {Array} dash
     * @returns {Array}
     * @example
     *  // apply dashed stroke that is 10px long and 5 pixels apart
     *  line.dash([10, 5]);
     *  // apply dashed stroke that is made up of alternating dashed
     *  // lines that are 10px long and 20px apart, and dots that have
     *  // a radius of 5px and are 20px apart
     *  line.dash([10, 20, 0.001, 20]);
     */
    Factory.addGetterSetter(Shape, 'dashOffset', 0, getNumberValidator());
    /**
     * get/set dash offset for stroke.
     * @name Konva.Shape#dash
     * @method
     * @param {Number} dash offset
     * @returns {Number}
     * @example
     *  // apply dashed stroke that is 10px long and 5 pixels apart with an offset of 5px
     *  line.dash([10, 5]);
     *  line.dashOffset(5);
     */
    Factory.addGetterSetter(Shape, 'shadowColor', undefined, getStringValidator());
    /**
     * get/set shadow color
     * @name Konva.Shape#shadowColor
     * @method
     * @param {String} color
     * @returns {String}
     * @example
     * // get shadow color
     * var shadow = shape.shadowColor();
     *
     * // set shadow color with color string
     * shape.shadowColor('green');
     *
     * // set shadow color with hex
     * shape.shadowColor('#00ff00');
     *
     * // set shadow color with rgb
     * shape.shadowColor('rgb(0,255,0)');
     *
     * // set shadow color with rgba and make it 50% opaque
     * shape.shadowColor('rgba(0,255,0,0.5');
     */
    Factory.addGetterSetter(Shape, 'shadowBlur', 0, getNumberValidator());
    /**
     * get/set shadow blur
     * @name Konva.Shape#shadowBlur
     * @method
     * @param {Number} blur
     * @returns {Number}
     * @example
     * // get shadow blur
     * var shadowBlur = shape.shadowBlur();
     *
     * // set shadow blur
     * shape.shadowBlur(10);
     */
    Factory.addGetterSetter(Shape, 'shadowOpacity', 1, getNumberValidator());
    /**
     * get/set shadow opacity.  must be a value between 0 and 1
     * @name Konva.Shape#shadowOpacity
     * @method
     * @param {Number} opacity
     * @returns {Number}
     * @example
     * // get shadow opacity
     * var shadowOpacity = shape.shadowOpacity();
     *
     * // set shadow opacity
     * shape.shadowOpacity(0.5);
     */
    Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);
    /**
     * get/set shadow offset
     * @name Konva.Shape#shadowOffset
     * @method
     * @param {Object} offset
     * @param {Number} offset.x
     * @param {Number} offset.y
     * @returns {Object}
     * @example
     * // get shadow offset
     * var shadowOffset = shape.shadowOffset();
     *
     * // set shadow offset
     * shape.shadowOffset({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, getNumberValidator());
    /**
     * get/set shadow offset x
     * @name Konva.Shape#shadowOffsetX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get shadow offset x
     * var shadowOffsetX = shape.shadowOffsetX();
     *
     * // set shadow offset x
     * shape.shadowOffsetX(5);
     */
    Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, getNumberValidator());
    /**
     * get/set shadow offset y
     * @name Konva.Shape#shadowOffsetY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get shadow offset y
     * var shadowOffsetY = shape.shadowOffsetY();
     *
     * // set shadow offset y
     * shape.shadowOffsetY(5);
     */
    Factory.addGetterSetter(Shape, 'fillPatternImage');
    /**
     * get/set fill pattern image
     * @name Konva.Shape#fillPatternImage
     * @method
     * @param {Image} image object
     * @returns {Image}
     * @example
     * // get fill pattern image
     * var fillPatternImage = shape.fillPatternImage();
     *
     * // set fill pattern image
     * var imageObj = new Image();
     * imageObj.onload = function() {
     *   shape.fillPatternImage(imageObj);
     * };
     * imageObj.src = 'path/to/image/jpg';
     */
    Factory.addGetterSetter(Shape, 'fill', undefined, getStringOrGradientValidator());
    /**
     * get/set fill color
     * @name Konva.Shape#fill
     * @method
     * @param {String} color
     * @returns {String}
     * @example
     * // get fill color
     * var fill = shape.fill();
     *
     * // set fill color with color string
     * shape.fill('green');
     *
     * // set fill color with hex
     * shape.fill('#00ff00');
     *
     * // set fill color with rgb
     * shape.fill('rgb(0,255,0)');
     *
     * // set fill color with rgba and make it 50% opaque
     * shape.fill('rgba(0,255,0,0.5');
     *
     * // shape without fill
     * shape.fill(null);
     */
    Factory.addGetterSetter(Shape, 'fillPatternX', 0, getNumberValidator());
    /**
     * get/set fill pattern x
     * @name Konva.Shape#fillPatternX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill pattern x
     * var fillPatternX = shape.fillPatternX();
     * // set fill pattern x
     * shape.fillPatternX(20);
     */
    Factory.addGetterSetter(Shape, 'fillPatternY', 0, getNumberValidator());
    /**
     * get/set fill pattern y
     * @name Konva.Shape#fillPatternY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill pattern y
     * var fillPatternY = shape.fillPatternY();
     * // set fill pattern y
     * shape.fillPatternY(20);
     */
    Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');
    /**
     * get/set fill linear gradient color stops
     * @name Konva.Shape#fillLinearGradientColorStops
     * @method
     * @param {Array} colorStops
     * @returns {Array} colorStops
     * @example
     * // get fill linear gradient color stops
     * var colorStops = shape.fillLinearGradientColorStops();
     *
     * // create a linear gradient that starts with red, changes to blue
     * // halfway through, and then changes to green
     * shape.fillLinearGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
     */
    Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');
    /**
     * get/set stroke linear gradient color stops
     * @name Konva.Shape#strokeLinearGradientColorStops
     * @method
     * @param {Array} colorStops
     * @returns {Array} colorStops
     * @example
     * // get stroke linear gradient color stops
     * var colorStops = shape.strokeLinearGradientColorStops();
     *
     * // create a linear gradient that starts with red, changes to blue
     * // halfway through, and then changes to green
     * shape.strokeLinearGradientColorStops([0, 'red', 0.5, 'blue', 1, 'green']);
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);
    /**
     * get/set fill radial gradient start radius
     * @name Konva.Shape#fillRadialGradientStartRadius
     * @method
     * @param {Number} radius
     * @returns {Number}
     * @example
     * // get radial gradient start radius
     * var startRadius = shape.fillRadialGradientStartRadius();
     *
     * // set radial gradient start radius
     * shape.fillRadialGradientStartRadius(0);
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);
    /**
     * get/set fill radial gradient end radius
     * @name Konva.Shape#fillRadialGradientEndRadius
     * @method
     * @param {Number} radius
     * @returns {Number}
     * @example
     * // get radial gradient end radius
     * var endRadius = shape.fillRadialGradientEndRadius();
     *
     * // set radial gradient end radius
     * shape.fillRadialGradientEndRadius(100);
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');
    /**
     * get/set fill radial gradient color stops
     * @name Konva.Shape#fillRadialGradientColorStops
     * @method
     * @param {Number} colorStops
     * @returns {Array}
     * @example
     * // get fill radial gradient color stops
     * var colorStops = shape.fillRadialGradientColorStops();
     *
     * // create a radial gradient that starts with red, changes to blue
     * // halfway through, and then changes to green
     * shape.fillRadialGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
     */
    Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');
    /**
     * get/set fill pattern repeat.  Can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'repeat'
     * @name Konva.Shape#fillPatternRepeat
     * @method
     * @param {String} repeat
     * @returns {String}
     * @example
     * // get fill pattern repeat
     * var repeat = shape.fillPatternRepeat();
     *
     * // repeat pattern in x direction only
     * shape.fillPatternRepeat('repeat-x');
     *
     * // do not repeat the pattern
     * shape.fillPatternRepeat('no-repeat');
     */
    Factory.addGetterSetter(Shape, 'fillEnabled', true);
    /**
     * get/set fill enabled flag
     * @name Konva.Shape#fillEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get fill enabled flag
     * var fillEnabled = shape.fillEnabled();
     *
     * // disable fill
     * shape.fillEnabled(false);
     *
     * // enable fill
     * shape.fillEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'strokeEnabled', true);
    /**
     * get/set stroke enabled flag
     * @name Konva.Shape#strokeEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get stroke enabled flag
     * var strokeEnabled = shape.strokeEnabled();
     *
     * // disable stroke
     * shape.strokeEnabled(false);
     *
     * // enable stroke
     * shape.strokeEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'shadowEnabled', true);
    /**
     * get/set shadow enabled flag
     * @name Konva.Shape#shadowEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get shadow enabled flag
     * var shadowEnabled = shape.shadowEnabled();
     *
     * // disable shadow
     * shape.shadowEnabled(false);
     *
     * // enable shadow
     * shape.shadowEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'dashEnabled', true);
    /**
     * get/set dash enabled flag
     * @name Konva.Shape#dashEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get dash enabled flag
     * var dashEnabled = shape.dashEnabled();
     *
     * // disable dash
     * shape.dashEnabled(false);
     *
     * // enable dash
     * shape.dashEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);
    /**
     * get/set strokeScale enabled flag
     * @name Konva.Shape#strokeScaleEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get stroke scale enabled flag
     * var strokeScaleEnabled = shape.strokeScaleEnabled();
     *
     * // disable stroke scale
     * shape.strokeScaleEnabled(false);
     *
     * // enable stroke scale
     * shape.strokeScaleEnabled(true);
     */
    Factory.addGetterSetter(Shape, 'fillPriority', 'color');
    /**
     * get/set fill priority.  can be color, pattern, linear-gradient, or radial-gradient.  The default is color.
     *   This is handy if you want to toggle between different fill types.
     * @name Konva.Shape#fillPriority
     * @method
     * @param {String} priority
     * @returns {String}
     * @example
     * // get fill priority
     * var fillPriority = shape.fillPriority();
     *
     * // set fill priority
     * shape.fillPriority('linear-gradient');
     */
    Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);
    /**
     * get/set fill pattern offset
     * @name Konva.Shape#fillPatternOffset
     * @method
     * @param {Object} offset
     * @param {Number} offset.x
     * @param {Number} offset.y
     * @returns {Object}
     * @example
     * // get fill pattern offset
     * var patternOffset = shape.fillPatternOffset();
     *
     * // set fill pattern offset
     * shape.fillPatternOffset({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, getNumberValidator());
    /**
     * get/set fill pattern offset x
     * @name Konva.Shape#fillPatternOffsetX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill pattern offset x
     * var patternOffsetX = shape.fillPatternOffsetX();
     *
     * // set fill pattern offset x
     * shape.fillPatternOffsetX(20);
     */
    Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, getNumberValidator());
    /**
     * get/set fill pattern offset y
     * @name Konva.Shape#fillPatternOffsetY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill pattern offset y
     * var patternOffsetY = shape.fillPatternOffsetY();
     *
     * // set fill pattern offset y
     * shape.fillPatternOffsetY(10);
     */
    Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);
    /**
     * get/set fill pattern scale
     * @name Konva.Shape#fillPatternScale
     * @method
     * @param {Object} scale
     * @param {Number} scale.x
     * @param {Number} scale.y
     * @returns {Object}
     * @example
     * // get fill pattern scale
     * var patternScale = shape.fillPatternScale();
     *
     * // set fill pattern scale
     * shape.fillPatternScale({
     *   x: 2,
     *   y: 2
     * });
     */
    Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, getNumberValidator());
    /**
     * get/set fill pattern scale x
     * @name Konva.Shape#fillPatternScaleX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill pattern scale x
     * var patternScaleX = shape.fillPatternScaleX();
     *
     * // set fill pattern scale x
     * shape.fillPatternScaleX(2);
     */
    Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, getNumberValidator());
    /**
     * get/set fill pattern scale y
     * @name Konva.Shape#fillPatternScaleY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill pattern scale y
     * var patternScaleY = shape.fillPatternScaleY();
     *
     * // set fill pattern scale y
     * shape.fillPatternScaleY(2);
     */
    Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set fill linear gradient start point
     * @name Konva.Shape#fillLinearGradientStartPoint
     * @method
     * @param {Object} startPoint
     * @param {Number} startPoint.x
     * @param {Number} startPoint.y
     * @returns {Object}
     * @example
     * // get fill linear gradient start point
     * var startPoint = shape.fillLinearGradientStartPoint();
     *
     * // set fill linear gradient start point
     * shape.fillLinearGradientStartPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set stroke linear gradient start point
     * @name Konva.Shape#strokeLinearGradientStartPoint
     * @method
     * @param {Object} startPoint
     * @param {Number} startPoint.x
     * @param {Number} startPoint.y
     * @returns {Object}
     * @example
     * // get stroke linear gradient start point
     * var startPoint = shape.strokeLinearGradientStartPoint();
     *
     * // set stroke linear gradient start point
     * shape.strokeLinearGradientStartPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);
    /**
     * get/set fill linear gradient start point x
     * @name Konva.Shape#fillLinearGradientStartPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill linear gradient start point x
     * var startPointX = shape.fillLinearGradientStartPointX();
     *
     * // set fill linear gradient start point x
     * shape.fillLinearGradientStartPointX(20);
     */
    Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);
    /**
     * get/set stroke linear gradient start point x
     * @name Konva.Shape#linearLinearGradientStartPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get stroke linear gradient start point x
     * var startPointX = shape.strokeLinearGradientStartPointX();
     *
     * // set stroke linear gradient start point x
     * shape.strokeLinearGradientStartPointX(20);
     */
    Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);
    /**
     * get/set fill linear gradient start point y
     * @name Konva.Shape#fillLinearGradientStartPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill linear gradient start point y
     * var startPointY = shape.fillLinearGradientStartPointY();
     *
     * // set fill linear gradient start point y
     * shape.fillLinearGradientStartPointY(20);
     */
    Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
    /**
     * get/set stroke linear gradient start point y
     * @name Konva.Shape#strokeLinearGradientStartPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get stroke linear gradient start point y
     * var startPointY = shape.strokeLinearGradientStartPointY();
     *
     * // set stroke linear gradient start point y
     * shape.strokeLinearGradientStartPointY(20);
     */
    Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set fill linear gradient end point
     * @name Konva.Shape#fillLinearGradientEndPoint
     * @method
     * @param {Object} endPoint
     * @param {Number} endPoint.x
     * @param {Number} endPoint.y
     * @returns {Object}
     * @example
     * // get fill linear gradient end point
     * var endPoint = shape.fillLinearGradientEndPoint();
     *
     * // set fill linear gradient end point
     * shape.fillLinearGradientEndPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set stroke linear gradient end point
     * @name Konva.Shape#strokeLinearGradientEndPoint
     * @method
     * @param {Object} endPoint
     * @param {Number} endPoint.x
     * @param {Number} endPoint.y
     * @returns {Object}
     * @example
     * // get stroke linear gradient end point
     * var endPoint = shape.strokeLinearGradientEndPoint();
     *
     * // set stroke linear gradient end point
     * shape.strokeLinearGradientEndPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
    /**
     * get/set fill linear gradient end point x
     * @name Konva.Shape#fillLinearGradientEndPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill linear gradient end point x
     * var endPointX = shape.fillLinearGradientEndPointX();
     *
     * // set fill linear gradient end point x
     * shape.fillLinearGradientEndPointX(20);
     */
    Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
    /**
     * get/set fill linear gradient end point x
     * @name Konva.Shape#strokeLinearGradientEndPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get stroke linear gradient end point x
     * var endPointX = shape.strokeLinearGradientEndPointX();
     *
     * // set stroke linear gradient end point x
     * shape.strokeLinearGradientEndPointX(20);
     */
    Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
    /**
     * get/set fill linear gradient end point y
     * @name Konva.Shape#fillLinearGradientEndPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill linear gradient end point y
     * var endPointY = shape.fillLinearGradientEndPointY();
     *
     * // set fill linear gradient end point y
     * shape.fillLinearGradientEndPointY(20);
     */
    Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
    /**
     * get/set stroke linear gradient end point y
     * @name Konva.Shape#strokeLinearGradientEndPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get stroke linear gradient end point y
     * var endPointY = shape.strokeLinearGradientEndPointY();
     *
     * // set stroke linear gradient end point y
     * shape.strokeLinearGradientEndPointY(20);
     */
    Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set fill radial gradient start point
     * @name Konva.Shape#fillRadialGradientStartPoint
     * @method
     * @param {Object} startPoint
     * @param {Number} startPoint.x
     * @param {Number} startPoint.y
     * @returns {Object}
     * @example
     * // get fill radial gradient start point
     * var startPoint = shape.fillRadialGradientStartPoint();
     *
     * // set fill radial gradient start point
     * shape.fillRadialGradientStartPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
    /**
     * get/set fill radial gradient start point x
     * @name Konva.Shape#fillRadialGradientStartPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill radial gradient start point x
     * var startPointX = shape.fillRadialGradientStartPointX();
     *
     * // set fill radial gradient start point x
     * shape.fillRadialGradientStartPointX(20);
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
    /**
     * get/set fill radial gradient start point y
     * @name Konva.Shape#fillRadialGradientStartPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill radial gradient start point y
     * var startPointY = shape.fillRadialGradientStartPointY();
     *
     * // set fill radial gradient start point y
     * shape.fillRadialGradientStartPointY(20);
     */
    Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
        'x',
        'y',
    ]);
    /**
     * get/set fill radial gradient end point
     * @name Konva.Shape#fillRadialGradientEndPoint
     * @method
     * @param {Object} endPoint
     * @param {Number} endPoint.x
     * @param {Number} endPoint.y
     * @returns {Object}
     * @example
     * // get fill radial gradient end point
     * var endPoint = shape.fillRadialGradientEndPoint();
     *
     * // set fill radial gradient end point
     * shape.fillRadialGradientEndPoint({
     *   x: 20,
     *   y: 10
     * });
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
    /**
     * get/set fill radial gradient end point x
     * @name Konva.Shape#fillRadialGradientEndPointX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get fill radial gradient end point x
     * var endPointX = shape.fillRadialGradientEndPointX();
     *
     * // set fill radial gradient end point x
     * shape.fillRadialGradientEndPointX(20);
     */
    Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
    /**
     * get/set fill radial gradient end point y
     * @name Konva.Shape#fillRadialGradientEndPointY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get fill radial gradient end point y
     * var endPointY = shape.fillRadialGradientEndPointY();
     *
     * // set fill radial gradient end point y
     * shape.fillRadialGradientEndPointY(20);
     */
    Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);
    /**
     * get/set fill pattern rotation in degrees
     * @name Konva.Shape#fillPatternRotation
     * @method
     * @param {Number} rotation
     * @returns {Konva.Shape}
     * @example
     * // get fill pattern rotation
     * var patternRotation = shape.fillPatternRotation();
     *
     * // set fill pattern rotation
     * shape.fillPatternRotation(20);
     */
    Factory.backCompat(Shape, {
        dashArray: 'dash',
        getDashArray: 'getDash',
        setDashArray: 'getDash',
        drawFunc: 'sceneFunc',
        getDrawFunc: 'getSceneFunc',
        setDrawFunc: 'setSceneFunc',
        drawHitFunc: 'hitFunc',
        getDrawHitFunc: 'getHitFunc',
        setDrawHitFunc: 'setHitFunc',
    });
  
    // constants
    var HASH = '#', BEFORE_DRAW = 'beforeDraw', DRAW = 'draw', 
    /*
     * 2 - 3 - 4
     * |       |
     * 1 - 0   5
     *         |
     * 8 - 7 - 6
     */
    INTERSECTION_OFFSETS = [
        { x: 0, y: 0 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 }, // 8
    ], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
    /**
     * Layer constructor.  Layers are tied to their own canvas element and are used
     * to contain groups or shapes.
     * @constructor
     * @memberof Konva
     * @augments Konva.Container
     * @param {Object} config
     * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
     * to clear the canvas before each layer draw.  The default value is true.
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * * @param {Object} [config.clip] set clip
       * @param {Number} [config.clipX] set clip x
       * @param {Number} [config.clipY] set clip y
       * @param {Number} [config.clipWidth] set clip width
       * @param {Number} [config.clipHeight] set clip height
       * @param {Function} [config.clipFunc] set clip func
  
     * @example
     * var layer = new Konva.Layer();
     * stage.add(layer);
     * // now you can add shapes, groups into the layer
     */
    class Layer extends Container {
        constructor(config) {
            super(config);
            this.canvas = new SceneCanvas();
            this.hitCanvas = new HitCanvas({
                pixelRatio: 1,
            });
            this._waitingForDraw = false;
            this.on('visibleChange.konva', this._checkVisibility);
            this._checkVisibility();
            this.on('imageSmoothingEnabledChange.konva', this._setSmoothEnabled);
            this._setSmoothEnabled();
        }
        // for nodejs?
        createPNGStream() {
            const c = this.canvas._canvas;
            return c.createPNGStream();
        }
        /**
         * get layer canvas wrapper
         * @method
         * @name Konva.Layer#getCanvas
         */
        getCanvas() {
            return this.canvas;
        }
        /**
         * get native canvas element
         * @method
         * @name Konva.Layer#getNativeCanvasElement
         */
        getNativeCanvasElement() {
            return this.canvas._canvas;
        }
        /**
         * get layer hit canvas
         * @method
         * @name Konva.Layer#getHitCanvas
         */
        getHitCanvas() {
            return this.hitCanvas;
        }
        /**
         * get layer canvas context
         * @method
         * @name Konva.Layer#getContext
         */
        getContext() {
            return this.getCanvas().getContext();
        }
        // TODO: deprecate this method
        clear(bounds) {
            this.getContext().clear(bounds);
            this.getHitCanvas().getContext().clear(bounds);
            return this;
        }
        // extend Node.prototype.setZIndex
        setZIndex(index) {
            super.setZIndex(index);
            var stage = this.getStage();
            if (stage && stage.content) {
                stage.content.removeChild(this.getNativeCanvasElement());
                if (index < stage.children.length - 1) {
                    stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[index + 1].getCanvas()._canvas);
                }
                else {
                    stage.content.appendChild(this.getNativeCanvasElement());
                }
            }
            return this;
        }
        moveToTop() {
            Node.prototype.moveToTop.call(this);
            var stage = this.getStage();
            if (stage && stage.content) {
                stage.content.removeChild(this.getNativeCanvasElement());
                stage.content.appendChild(this.getNativeCanvasElement());
            }
            return true;
        }
        moveUp() {
            var moved = Node.prototype.moveUp.call(this);
            if (!moved) {
                return false;
            }
            var stage = this.getStage();
            if (!stage || !stage.content) {
                return false;
            }
            stage.content.removeChild(this.getNativeCanvasElement());
            if (this.index < stage.children.length - 1) {
                stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[this.index + 1].getCanvas()._canvas);
            }
            else {
                stage.content.appendChild(this.getNativeCanvasElement());
            }
            return true;
        }
        // extend Node.prototype.moveDown
        moveDown() {
            if (Node.prototype.moveDown.call(this)) {
                var stage = this.getStage();
                if (stage) {
                    var children = stage.children;
                    if (stage.content) {
                        stage.content.removeChild(this.getNativeCanvasElement());
                        stage.content.insertBefore(this.getNativeCanvasElement(), children[this.index + 1].getCanvas()._canvas);
                    }
                }
                return true;
            }
            return false;
        }
        // extend Node.prototype.moveToBottom
        moveToBottom() {
            if (Node.prototype.moveToBottom.call(this)) {
                var stage = this.getStage();
                if (stage) {
                    var children = stage.children;
                    if (stage.content) {
                        stage.content.removeChild(this.getNativeCanvasElement());
                        stage.content.insertBefore(this.getNativeCanvasElement(), children[1].getCanvas()._canvas);
                    }
                }
                return true;
            }
            return false;
        }
        getLayer() {
            return this;
        }
        remove() {
            var _canvas = this.getNativeCanvasElement();
            Node.prototype.remove.call(this);
            if (_canvas && _canvas.parentNode && Util._isInDocument(_canvas)) {
                _canvas.parentNode.removeChild(_canvas);
            }
            return this;
        }
        getStage() {
            return this.parent;
        }
        setSize({ width, height }) {
            this.canvas.setSize(width, height);
            this.hitCanvas.setSize(width, height);
            this._setSmoothEnabled();
            return this;
        }
        _validateAdd(child) {
            var type = child.getType();
            if (type !== 'Group' && type !== 'Shape') {
                Util.throw('You may only add groups and shapes to a layer.');
            }
        }
        _toKonvaCanvas(config) {
            config = config || {};
            config.width = config.width || this.getWidth();
            config.height = config.height || this.getHeight();
            config.x = config.x !== undefined ? config.x : this.x();
            config.y = config.y !== undefined ? config.y : this.y();
            return Node.prototype._toKonvaCanvas.call(this, config);
        }
        _checkVisibility() {
            const visible = this.visible();
            if (visible) {
                this.canvas._canvas.style.display = 'block';
            }
            else {
                this.canvas._canvas.style.display = 'none';
            }
        }
        _setSmoothEnabled() {
            this.getContext()._context.imageSmoothingEnabled =
                this.imageSmoothingEnabled();
        }
        /**
         * get/set width of layer. getter return width of stage. setter doing nothing.
         * if you want change width use `stage.width(value);`
         * @name Konva.Layer#width
         * @method
         * @returns {Number}
         * @example
         * var width = layer.width();
         */
        getWidth() {
            if (this.parent) {
                return this.parent.width();
            }
        }
        setWidth() {
            Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
        }
        /**
         * get/set height of layer.getter return height of stage. setter doing nothing.
         * if you want change height use `stage.height(value);`
         * @name Konva.Layer#height
         * @method
         * @returns {Number}
         * @example
         * var height = layer.height();
         */
        getHeight() {
            if (this.parent) {
                return this.parent.height();
            }
        }
        setHeight() {
            Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
        }
        /**
         * batch draw. this function will not do immediate draw
         * but it will schedule drawing to next tick (requestAnimFrame)
         * @method
         * @name Konva.Layer#batchDraw
         * @return {Konva.Layer} this
         */
        batchDraw() {
            if (!this._waitingForDraw) {
                this._waitingForDraw = true;
                Util.requestAnimFrame(() => {
                    this.draw();
                    this._waitingForDraw = false;
                });
            }
            return this;
        }
        /**
         * get visible intersection shape. This is the preferred
         * method for determining if a point intersects a shape or not
         * also you may pass optional selector parameter to return ancestor of intersected shape
         * @method
         * @name Konva.Layer#getIntersection
         * @param {Object} pos
         * @param {Number} pos.x
         * @param {Number} pos.y
         * @returns {Konva.Node}
         * @example
         * var shape = layer.getIntersection({x: 50, y: 50});
         */
        getIntersection(pos) {
            if (!this.isListening() || !this.isVisible()) {
                return null;
            }
            // in some cases antialiased area may be bigger than 1px
            // it is possible if we will cache node, then scale it a lot
            var spiralSearchDistance = 1;
            var continueSearch = false;
            while (true) {
                for (let i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                    const intersectionOffset = INTERSECTION_OFFSETS[i];
                    const obj = this._getIntersection({
                        x: pos.x + intersectionOffset.x * spiralSearchDistance,
                        y: pos.y + intersectionOffset.y * spiralSearchDistance,
                    });
                    const shape = obj.shape;
                    if (shape) {
                        return shape;
                    }
                    // we should continue search if we found antialiased pixel
                    // that means our node somewhere very close
                    continueSearch = !!obj.antialiased;
                    // stop search if found empty pixel
                    if (!obj.antialiased) {
                        break;
                    }
                }
                // if no shape, and no antialiased pixel, we should end searching
                if (continueSearch) {
                    spiralSearchDistance += 1;
                }
                else {
                    return null;
                }
            }
        }
        _getIntersection(pos) {
            const ratio = this.hitCanvas.pixelRatio;
            const p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data;
            const p3 = p[3];
            // fully opaque pixel
            if (p3 === 255) {
                const colorKey = Util._rgbToHex(p[0], p[1], p[2]);
                const shape = shapes[HASH + colorKey];
                if (shape) {
                    return {
                        shape: shape,
                    };
                }
                return {
                    antialiased: true,
                };
            }
            else if (p3 > 0) {
                // antialiased pixel
                return {
                    antialiased: true,
                };
            }
            // empty pixel
            return {};
        }
        drawScene(can, top) {
            var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
            this._fire(BEFORE_DRAW, {
                node: this,
            });
            if (this.clearBeforeDraw()) {
                canvas.getContext().clear();
            }
            Container.prototype.drawScene.call(this, canvas, top);
            this._fire(DRAW, {
                node: this,
            });
            return this;
        }
        drawHit(can, top) {
            var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas);
            if (layer && layer.clearBeforeDraw()) {
                layer.getHitCanvas().getContext().clear();
            }
            Container.prototype.drawHit.call(this, canvas, top);
            return this;
        }
        /**
         * enable hit graph. **DEPRECATED!** Use `layer.listening(true)` instead.
         * @name Konva.Layer#enableHitGraph
         * @method
         * @returns {Layer}
         */
        enableHitGraph() {
            this.hitGraphEnabled(true);
            return this;
        }
        /**
         * disable hit graph. **DEPRECATED!** Use `layer.listening(false)` instead.
         * @name Konva.Layer#disableHitGraph
         * @method
         * @returns {Layer}
         */
        disableHitGraph() {
            this.hitGraphEnabled(false);
            return this;
        }
        setHitGraphEnabled(val) {
            Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
            this.listening(val);
        }
        getHitGraphEnabled(val) {
            Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
            return this.listening();
        }
        /**
         * Show or hide hit canvas over the stage. May be useful for debugging custom hitFunc
         * @name Konva.Layer#toggleHitCanvas
         * @method
         */
        toggleHitCanvas() {
            if (!this.parent || !this.parent['content']) {
                return;
            }
            var parent = this.parent;
            var added = !!this.hitCanvas._canvas.parentNode;
            if (added) {
                parent.content.removeChild(this.hitCanvas._canvas);
            }
            else {
                parent.content.appendChild(this.hitCanvas._canvas);
            }
        }
    }
    Layer.prototype.nodeType = 'Layer';
    _registerNode(Layer);
    /**
     * get/set imageSmoothingEnabled flag
     * For more info see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
     * @name Konva.Layer#imageSmoothingEnabled
     * @method
     * @param {Boolean} imageSmoothingEnabled
     * @returns {Boolean}
     * @example
     * // get imageSmoothingEnabled flag
     * var imageSmoothingEnabled = layer.imageSmoothingEnabled();
     *
     * layer.imageSmoothingEnabled(false);
     *
     * layer.imageSmoothingEnabled(true);
     */
    Factory.addGetterSetter(Layer, 'imageSmoothingEnabled', true);
    /**
     * get/set clearBeforeDraw flag which determines if the layer is cleared or not
     *  before drawing
     * @name Konva.Layer#clearBeforeDraw
     * @method
     * @param {Boolean} clearBeforeDraw
     * @returns {Boolean}
     * @example
     * // get clearBeforeDraw flag
     * var clearBeforeDraw = layer.clearBeforeDraw();
     *
     * // disable clear before draw
     * layer.clearBeforeDraw(false);
     *
     * // enable clear before draw
     * layer.clearBeforeDraw(true);
     */
    Factory.addGetterSetter(Layer, 'clearBeforeDraw', true);
    Factory.addGetterSetter(Layer, 'hitGraphEnabled', true, getBooleanValidator());
    /**
     * get/set hitGraphEnabled flag.  **DEPRECATED!** Use `layer.listening(false)` instead.
     *  Disabling the hit graph will greatly increase
     *  draw performance because the hit graph will not be redrawn each time the layer is
     *  drawn.  This, however, also disables mouse/touch event detection
     * @name Konva.Layer#hitGraphEnabled
     * @method
     * @param {Boolean} enabled
     * @returns {Boolean}
     * @example
     * // get hitGraphEnabled flag
     * var hitGraphEnabled = layer.hitGraphEnabled();
     *
     * // disable hit graph
     * layer.hitGraphEnabled(false);
     *
     * // enable hit graph
     * layer.hitGraphEnabled(true);
     */
  
    /**
     * FastLayer constructor. **DEPRECATED!** Please use `Konva.Layer({ listening: false})` instead. Layers are tied to their own canvas element and are used
     * to contain shapes only.  If you don't need node nesting, mouse and touch interactions,
     * or event pub/sub, you should use FastLayer instead of Layer to create your layers.
     * It renders about 2x faster than normal layers.
     *
     * @constructor
     * @memberof Konva
     * @augments Konva.Layer
     * * @param {Object} [config.clip] set clip
       * @param {Number} [config.clipX] set clip x
       * @param {Number} [config.clipY] set clip y
       * @param {Number} [config.clipWidth] set clip width
       * @param {Number} [config.clipHeight] set clip height
       * @param {Function} [config.clipFunc] set clip func
  
     * @example
     * var layer = new Konva.FastLayer();
     */
    class FastLayer extends Layer {
        constructor(attrs) {
            super(attrs);
            this.listening(false);
            Util.warn('Konva.Fast layer is deprecated. Please use "new Konva.Layer({ listening: false })" instead.');
        }
    }
    FastLayer.prototype.nodeType = 'FastLayer';
    _registerNode(FastLayer);
  
    /**
     * Group constructor.  Groups are used to contain shapes or other groups.
     * @constructor
     * @memberof Konva
     * @augments Konva.Container
     * @param {Object} config
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * * @param {Object} [config.clip] set clip
       * @param {Number} [config.clipX] set clip x
       * @param {Number} [config.clipY] set clip y
       * @param {Number} [config.clipWidth] set clip width
       * @param {Number} [config.clipHeight] set clip height
       * @param {Function} [config.clipFunc] set clip func
  
     * @example
     * var group = new Konva.Group();
     */
    class Group extends Container {
        _validateAdd(child) {
            var type = child.getType();
            if (type !== 'Group' && type !== 'Shape') {
                Util.throw('You may only add groups and shapes to groups.');
            }
        }
    }
    Group.prototype.nodeType = 'Group';
    _registerNode(Group);
  
    var now = (function () {
        if (glob.performance && glob.performance.now) {
            return function () {
                return glob.performance.now();
            };
        }
        return function () {
            return new Date().getTime();
        };
    })();
    /**
     * Animation constructor.
     * @constructor
     * @memberof Konva
     * @param {AnimationFn} func function executed on each animation frame.  The function is passed a frame object, which contains
     *  timeDiff, lastTime, time, and frameRate properties.  The timeDiff property is the number of milliseconds that have passed
     *  since the last animation frame. The time property is the time in milliseconds that elapsed from the moment the animation started
     *  to the current animation frame. The lastTime property is a `time` value from the previous frame.  The frameRate property is the current frame rate in frames / second.
     *  Return false from function, if you don't need to redraw layer/layers on some frames.
     * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn on each animation frame. Can be a layer, an array of layers, or null.
     *  Not specifying a node will result in no redraw.
     * @example
     * // move a node to the right at 50 pixels / second
     * var velocity = 50;
     *
     * var anim = new Konva.Animation(function(frame) {
     *   var dist = velocity * (frame.timeDiff / 1000);
     *   node.move({x: dist, y: 0});
     * }, layer);
     *
     * anim.start();
     */
    class Animation {
        constructor(func, layers) {
            this.id = Animation.animIdCounter++;
            this.frame = {
                time: 0,
                timeDiff: 0,
                lastTime: now(),
                frameRate: 0,
            };
            this.func = func;
            this.setLayers(layers);
        }
        /**
         * set layers to be redrawn on each animation frame
         * @method
         * @name Konva.Animation#setLayers
         * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn. Can be a layer, an array of layers, or null.  Not specifying a node will result in no redraw.
         * @return {Konva.Animation} this
         */
        setLayers(layers) {
            var lays = [];
            // if passing in no layers
            if (!layers) {
                lays = [];
            }
            else if (layers.length > 0) {
                // if passing in an array of Layers
                // NOTE: layers could be an array.  for simplicity, I'm just inspecting
                // the length property to check for both cases
                lays = layers;
            }
            else {
                // if passing in a Layer
                lays = [layers];
            }
            this.layers = lays;
            return this;
        }
        /**
         * get layers
         * @method
         * @name Konva.Animation#getLayers
         * @return {Array} Array of Konva.Layer
         */
        getLayers() {
            return this.layers;
        }
        /**
         * add layer.  Returns true if the layer was added, and false if it was not
         * @method
         * @name Konva.Animation#addLayer
         * @param {Konva.Layer} layer to add
         * @return {Bool} true if layer is added to animation, otherwise false
         */
        addLayer(layer) {
            var layers = this.layers, len = layers.length, n;
            // don't add the layer if it already exists
            for (n = 0; n < len; n++) {
                if (layers[n]._id === layer._id) {
                    return false;
                }
            }
            this.layers.push(layer);
            return true;
        }
        /**
         * determine if animation is running or not.  returns true or false
         * @method
         * @name Konva.Animation#isRunning
         * @return {Bool} is animation running?
         */
        isRunning() {
            var a = Animation, animations = a.animations, len = animations.length, n;
            for (n = 0; n < len; n++) {
                if (animations[n].id === this.id) {
                    return true;
                }
            }
            return false;
        }
        /**
         * start animation
         * @method
         * @name Konva.Animation#start
         * @return {Konva.Animation} this
         */
        start() {
            this.stop();
            this.frame.timeDiff = 0;
            this.frame.lastTime = now();
            Animation._addAnimation(this);
            return this;
        }
        /**
         * stop animation
         * @method
         * @name Konva.Animation#stop
         * @return {Konva.Animation} this
         */
        stop() {
            Animation._removeAnimation(this);
            return this;
        }
        _updateFrameObject(time) {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
            this.frame.frameRate = 1000 / this.frame.timeDiff;
        }
        static _addAnimation(anim) {
            this.animations.push(anim);
            this._handleAnimation();
        }
        static _removeAnimation(anim) {
            var id = anim.id, animations = this.animations, len = animations.length, n;
            for (n = 0; n < len; n++) {
                if (animations[n].id === id) {
                    this.animations.splice(n, 1);
                    break;
                }
            }
        }
        static _runFrames() {
            var layerHash = {}, animations = this.animations, anim, layers, func, n, i, layersLen, layer, key, needRedraw;
            /*
             * loop through all animations and execute animation
             *  function.  if the animation object has specified node,
             *  we can add the node to the nodes hash to eliminate
             *  drawing the same node multiple times.  The node property
             *  can be the stage itself or a layer
             */
            /*
             * WARNING: don't cache animations.length because it could change while
             * the for loop is running, causing a JS error
             */
            for (n = 0; n < animations.length; n++) {
                anim = animations[n];
                layers = anim.layers;
                func = anim.func;
                anim._updateFrameObject(now());
                layersLen = layers.length;
                // if animation object has a function, execute it
                if (func) {
                    // allow anim bypassing drawing
                    needRedraw = func.call(anim, anim.frame) !== false;
                }
                else {
                    needRedraw = true;
                }
                if (!needRedraw) {
                    continue;
                }
                for (i = 0; i < layersLen; i++) {
                    layer = layers[i];
                    if (layer._id !== undefined) {
                        layerHash[layer._id] = layer;
                    }
                }
            }
            for (key in layerHash) {
                if (!layerHash.hasOwnProperty(key)) {
                    continue;
                }
                layerHash[key].batchDraw();
            }
        }
        static _animationLoop() {
            var Anim = Animation;
            if (Anim.animations.length) {
                Anim._runFrames();
                Util.requestAnimFrame(Anim._animationLoop);
            }
            else {
                Anim.animRunning = false;
            }
        }
        static _handleAnimation() {
            if (!this.animRunning) {
                this.animRunning = true;
                Util.requestAnimFrame(this._animationLoop);
            }
        }
    }
    Animation.animations = [];
    Animation.animIdCounter = 0;
    Animation.animRunning = false;
  
    var blacklist = {
        node: 1,
        duration: 1,
        easing: 1,
        onFinish: 1,
        yoyo: 1,
    }, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter = 0, colorAttrs = ['fill', 'stroke', 'shadowColor'];
    class TweenEngine {
        constructor(prop, propFunc, func, begin, finish, duration, yoyo) {
            this.prop = prop;
            this.propFunc = propFunc;
            this.begin = begin;
            this._pos = begin;
            this.duration = duration;
            this._change = 0;
            this.prevPos = 0;
            this.yoyo = yoyo;
            this._time = 0;
            this._position = 0;
            this._startTime = 0;
            this._finish = 0;
            this.func = func;
            this._change = finish - this.begin;
            this.pause();
        }
        fire(str) {
            var handler = this[str];
            if (handler) {
                handler();
            }
        }
        setTime(t) {
            if (t > this.duration) {
                if (this.yoyo) {
                    this._time = this.duration;
                    this.reverse();
                }
                else {
                    this.finish();
                }
            }
            else if (t < 0) {
                if (this.yoyo) {
                    this._time = 0;
                    this.play();
                }
                else {
                    this.reset();
                }
            }
            else {
                this._time = t;
                this.update();
            }
        }
        getTime() {
            return this._time;
        }
        setPosition(p) {
            this.prevPos = this._pos;
            this.propFunc(p);
            this._pos = p;
        }
        getPosition(t) {
            if (t === undefined) {
                t = this._time;
            }
            return this.func(t, this.begin, this._change, this.duration);
        }
        play() {
            this.state = PLAYING;
            this._startTime = this.getTimer() - this._time;
            this.onEnterFrame();
            this.fire('onPlay');
        }
        reverse() {
            this.state = REVERSING;
            this._time = this.duration - this._time;
            this._startTime = this.getTimer() - this._time;
            this.onEnterFrame();
            this.fire('onReverse');
        }
        seek(t) {
            this.pause();
            this._time = t;
            this.update();
            this.fire('onSeek');
        }
        reset() {
            this.pause();
            this._time = 0;
            this.update();
            this.fire('onReset');
        }
        finish() {
            this.pause();
            this._time = this.duration;
            this.update();
            this.fire('onFinish');
        }
        update() {
            this.setPosition(this.getPosition(this._time));
            this.fire('onUpdate');
        }
        onEnterFrame() {
            var t = this.getTimer() - this._startTime;
            if (this.state === PLAYING) {
                this.setTime(t);
            }
            else if (this.state === REVERSING) {
                this.setTime(this.duration - t);
            }
        }
        pause() {
            this.state = PAUSED;
            this.fire('onPause');
        }
        getTimer() {
            return new Date().getTime();
        }
    }
    /**
     * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
     *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
     *  a linear easing.  For more tweening options, check out {@link Konva.Easings}
     * @constructor
     * @memberof Konva
     * @example
     * // instantiate new tween which fully rotates a node in 1 second
     * var tween = new Konva.Tween({
     *   // list of tween specific properties
     *   node: node,
     *   duration: 1,
     *   easing: Konva.Easings.EaseInOut,
     *   onUpdate: () => console.log('node attrs updated')
     *   onFinish: () => console.log('finished'),
     *   // set new values for any attributes of a passed node
     *   rotation: 360,
     *   fill: 'red'
     * });
     *
     * // play tween
     * tween.play();
     *
     * // pause tween
     * tween.pause();
     */
    class Tween {
        constructor(config) {
            var that = this, node = config.node, nodeId = node._id, duration, easing = config.easing || Easings.Linear, yoyo = !!config.yoyo, key;
            if (typeof config.duration === 'undefined') {
                duration = 0.3;
            }
            else if (config.duration === 0) {
                // zero is bad value for duration
                duration = 0.001;
            }
            else {
                duration = config.duration;
            }
            this.node = node;
            this._id = idCounter++;
            var layers = node.getLayer() ||
                (node instanceof Konva$2['Stage'] ? node.getLayers() : null);
            if (!layers) {
                Util.error('Tween constructor have `node` that is not in a layer. Please add node into layer first.');
            }
            this.anim = new Animation(function () {
                that.tween.onEnterFrame();
            }, layers);
            this.tween = new TweenEngine(key, function (i) {
                that._tweenFunc(i);
            }, easing, 0, 1, duration * 1000, yoyo);
            this._addListeners();
            // init attrs map
            if (!Tween.attrs[nodeId]) {
                Tween.attrs[nodeId] = {};
            }
            if (!Tween.attrs[nodeId][this._id]) {
                Tween.attrs[nodeId][this._id] = {};
            }
            // init tweens map
            if (!Tween.tweens[nodeId]) {
                Tween.tweens[nodeId] = {};
            }
            for (key in config) {
                if (blacklist[key] === undefined) {
                    this._addAttr(key, config[key]);
                }
            }
            this.reset();
            // callbacks
            this.onFinish = config.onFinish;
            this.onReset = config.onReset;
            this.onUpdate = config.onUpdate;
        }
        _addAttr(key, end) {
            var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA;
            // remove conflict from tween map if it exists
            tweenId = Tween.tweens[nodeId][key];
            if (tweenId) {
                delete Tween.attrs[nodeId][tweenId][key];
            }
            // add to tween map
            start = node.getAttr(key);
            if (Util._isArray(end)) {
                diff = [];
                len = Math.max(end.length, start.length);
                if (key === 'points' && end.length !== start.length) {
                    // before tweening points we need to make sure that start.length === end.length
                    // Util._prepareArrayForTween thinking that end.length > start.length
                    if (end.length > start.length) {
                        // so in this case we will increase number of starting points
                        trueStart = start;
                        start = Util._prepareArrayForTween(start, end, node.closed());
                    }
                    else {
                        // in this case we will increase number of eding points
                        trueEnd = end;
                        end = Util._prepareArrayForTween(end, start, node.closed());
                    }
                }
                if (key.indexOf('fill') === 0) {
                    for (n = 0; n < len; n++) {
                        if (n % 2 === 0) {
                            diff.push(end[n] - start[n]);
                        }
                        else {
                            var startRGBA = Util.colorToRGBA(start[n]);
                            endRGBA = Util.colorToRGBA(end[n]);
                            start[n] = startRGBA;
                            diff.push({
                                r: endRGBA.r - startRGBA.r,
                                g: endRGBA.g - startRGBA.g,
                                b: endRGBA.b - startRGBA.b,
                                a: endRGBA.a - startRGBA.a,
                            });
                        }
                    }
                }
                else {
                    for (n = 0; n < len; n++) {
                        diff.push(end[n] - start[n]);
                    }
                }
            }
            else if (colorAttrs.indexOf(key) !== -1) {
                start = Util.colorToRGBA(start);
                endRGBA = Util.colorToRGBA(end);
                diff = {
                    r: endRGBA.r - start.r,
                    g: endRGBA.g - start.g,
                    b: endRGBA.b - start.b,
                    a: endRGBA.a - start.a,
                };
            }
            else {
                diff = end - start;
            }
            Tween.attrs[nodeId][this._id][key] = {
                start: start,
                diff: diff,
                end: end,
                trueEnd: trueEnd,
                trueStart: trueStart,
            };
            Tween.tweens[nodeId][key] = this._id;
        }
        _tweenFunc(i) {
            var node = this.node, attrs = Tween.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, end;
            for (key in attrs) {
                attr = attrs[key];
                start = attr.start;
                diff = attr.diff;
                end = attr.end;
                if (Util._isArray(start)) {
                    newVal = [];
                    len = Math.max(start.length, end.length);
                    if (key.indexOf('fill') === 0) {
                        for (n = 0; n < len; n++) {
                            if (n % 2 === 0) {
                                newVal.push((start[n] || 0) + diff[n] * i);
                            }
                            else {
                                newVal.push('rgba(' +
                                    Math.round(start[n].r + diff[n].r * i) +
                                    ',' +
                                    Math.round(start[n].g + diff[n].g * i) +
                                    ',' +
                                    Math.round(start[n].b + diff[n].b * i) +
                                    ',' +
                                    (start[n].a + diff[n].a * i) +
                                    ')');
                            }
                        }
                    }
                    else {
                        for (n = 0; n < len; n++) {
                            newVal.push((start[n] || 0) + diff[n] * i);
                        }
                    }
                }
                else if (colorAttrs.indexOf(key) !== -1) {
                    newVal =
                        'rgba(' +
                            Math.round(start.r + diff.r * i) +
                            ',' +
                            Math.round(start.g + diff.g * i) +
                            ',' +
                            Math.round(start.b + diff.b * i) +
                            ',' +
                            (start.a + diff.a * i) +
                            ')';
                }
                else {
                    newVal = start + diff * i;
                }
                node.setAttr(key, newVal);
            }
        }
        _addListeners() {
            // start listeners
            this.tween.onPlay = () => {
                this.anim.start();
            };
            this.tween.onReverse = () => {
                this.anim.start();
            };
            // stop listeners
            this.tween.onPause = () => {
                this.anim.stop();
            };
            this.tween.onFinish = () => {
                var node = this.node;
                // after tweening  points of line we need to set original end
                var attrs = Tween.attrs[node._id][this._id];
                if (attrs.points && attrs.points.trueEnd) {
                    node.setAttr('points', attrs.points.trueEnd);
                }
                if (this.onFinish) {
                    this.onFinish.call(this);
                }
            };
            this.tween.onReset = () => {
                var node = this.node;
                // after tweening  points of line we need to set original start
                var attrs = Tween.attrs[node._id][this._id];
                if (attrs.points && attrs.points.trueStart) {
                    node.points(attrs.points.trueStart);
                }
                if (this.onReset) {
                    this.onReset();
                }
            };
            this.tween.onUpdate = () => {
                if (this.onUpdate) {
                    this.onUpdate.call(this);
                }
            };
        }
        /**
         * play
         * @method
         * @name Konva.Tween#play
         * @returns {Tween}
         */
        play() {
            this.tween.play();
            return this;
        }
        /**
         * reverse
         * @method
         * @name Konva.Tween#reverse
         * @returns {Tween}
         */
        reverse() {
            this.tween.reverse();
            return this;
        }
        /**
         * reset
         * @method
         * @name Konva.Tween#reset
         * @returns {Tween}
         */
        reset() {
            this.tween.reset();
            return this;
        }
        /**
         * seek
         * @method
         * @name Konva.Tween#seek(
         * @param {Integer} t time in seconds between 0 and the duration
         * @returns {Tween}
         */
        seek(t) {
            this.tween.seek(t * 1000);
            return this;
        }
        /**
         * pause
         * @method
         * @name Konva.Tween#pause
         * @returns {Tween}
         */
        pause() {
            this.tween.pause();
            return this;
        }
        /**
         * finish
         * @method
         * @name Konva.Tween#finish
         * @returns {Tween}
         */
        finish() {
            this.tween.finish();
            return this;
        }
        /**
         * destroy
         * @method
         * @name Konva.Tween#destroy
         */
        destroy() {
            var nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId], key;
            this.pause();
            for (key in attrs) {
                delete Tween.tweens[nodeId][key];
            }
            delete Tween.attrs[nodeId][thisId];
        }
    }
    Tween.attrs = {};
    Tween.tweens = {};
    /**
     * Tween node properties. Shorter usage of {@link Konva.Tween} object.
     *
     * @method Konva.Node#to
     * @param {Object} [params] tween params
     * @example
     *
     * circle.to({
     *   x : 50,
     *   duration : 0.5,
     *   onUpdate: () => console.log('props updated'),
     *   onFinish: () => console.log('finished'),
     * });
     */
    Node.prototype.to = function (params) {
        var onFinish = params.onFinish;
        params.node = this;
        params.onFinish = function () {
            this.destroy();
            if (onFinish) {
                onFinish();
            }
        };
        var tween = new Tween(params);
        tween.play();
    };
    /*
     * These eases were ported from an Adobe Flash tweening library to JavaScript
     * by Xaric
     */
    /**
     * @namespace Easings
     * @memberof Konva
     */
    const Easings = {
        /**
         * back ease in
         * @function
         * @memberof Konva.Easings
         */
        BackEaseIn(t, b, c, d) {
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        /**
         * back ease out
         * @function
         * @memberof Konva.Easings
         */
        BackEaseOut(t, b, c, d) {
            var s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        /**
         * back ease in out
         * @function
         * @memberof Konva.Easings
         */
        BackEaseInOut(t, b, c, d) {
            var s = 1.70158;
            if ((t /= d / 2) < 1) {
                return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
            }
            return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        /**
         * elastic ease in
         * @function
         * @memberof Konva.Easings
         */
        ElasticEaseIn(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = (p / (2 * Math.PI)) * Math.asin(c / a);
            }
            return (-(a *
                Math.pow(2, 10 * (t -= 1)) *
                Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b);
        },
        /**
         * elastic ease out
         * @function
         * @memberof Konva.Easings
         */
        ElasticEaseOut(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = (p / (2 * Math.PI)) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
                c +
                b);
        },
        /**
         * elastic ease in out
         * @function
         * @memberof Konva.Easings
         */
        ElasticEaseInOut(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) === 2) {
                return b + c;
            }
            if (!p) {
                p = d * (0.3 * 1.5);
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = (p / (2 * Math.PI)) * Math.asin(c / a);
            }
            if (t < 1) {
                return (-0.5 *
                    (a *
                        Math.pow(2, 10 * (t -= 1)) *
                        Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
                    b);
            }
            return (a *
                Math.pow(2, -10 * (t -= 1)) *
                Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
                0.5 +
                c +
                b);
        },
        /**
         * bounce ease out
         * @function
         * @memberof Konva.Easings
         */
        BounceEaseOut(t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * (7.5625 * t * t) + b;
            }
            else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
            }
            else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
            }
            else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
            }
        },
        /**
         * bounce ease in
         * @function
         * @memberof Konva.Easings
         */
        BounceEaseIn(t, b, c, d) {
            return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
        },
        /**
         * bounce ease in out
         * @function
         * @memberof Konva.Easings
         */
        BounceEaseInOut(t, b, c, d) {
            if (t < d / 2) {
                return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
            }
            else {
                return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        },
        /**
         * ease in
         * @function
         * @memberof Konva.Easings
         */
        EaseIn(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        /**
         * ease out
         * @function
         * @memberof Konva.Easings
         */
        EaseOut(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        /**
         * ease in out
         * @function
         * @memberof Konva.Easings
         */
        EaseInOut(t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return (c / 2) * t * t + b;
            }
            return (-c / 2) * (--t * (t - 2) - 1) + b;
        },
        /**
         * strong ease in
         * @function
         * @memberof Konva.Easings
         */
        StrongEaseIn(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        /**
         * strong ease out
         * @function
         * @memberof Konva.Easings
         */
        StrongEaseOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        /**
         * strong ease in out
         * @function
         * @memberof Konva.Easings
         */
        StrongEaseInOut(t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return (c / 2) * t * t * t * t * t + b;
            }
            return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
        },
        /**
         * linear
         * @function
         * @memberof Konva.Easings
         */
        Linear(t, b, c, d) {
            return (c * t) / d + b;
        },
    };
  
    // what is core parts of Konva?
    const Konva$1 = Util._assign(Konva$2, {
        Util,
        Transform,
        Node,
        Container,
        Stage,
        stages,
        Layer,
        FastLayer,
        Group,
        DD,
        Shape,
        shapes,
        Animation,
        Tween,
        Easings,
        Context,
        Canvas,
    });
  
    /**
     * Arc constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Number} config.angle in degrees
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
     * @param {Boolean} [config.clockwise]
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * // draw a Arc that's pointing downwards
     * var arc = new Konva.Arc({
     *   innerRadius: 40,
     *   outerRadius: 80,
     *   fill: 'red',
     *   stroke: 'black'
     *   strokeWidth: 5,
     *   angle: 60,
     *   rotationDeg: -120
     * });
     */
    class Arc extends Shape {
        _sceneFunc(context) {
            var angle = Konva$2.getAngle(this.angle()), clockwise = this.clockwise();
            context.beginPath();
            context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
            context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
            context.closePath();
            context.fillStrokeShape(this);
        }
        getWidth() {
            return this.outerRadius() * 2;
        }
        getHeight() {
            return this.outerRadius() * 2;
        }
        setWidth(width) {
            this.outerRadius(width / 2);
        }
        setHeight(height) {
            this.outerRadius(height / 2);
        }
        getSelfRect() {
            const radius = this.outerRadius();
            const DEG_TO_RAD = Math.PI / 180;
            const angle = this.angle() * DEG_TO_RAD;
            const inc = 1 * DEG_TO_RAD;
            let end = angle + inc;
            if (this.clockwise()) {
                end = 360;
            }
            const xs = [];
            const ys = [];
            for (let i = 0; i < end; i += inc) {
                xs.push(Math.cos(i));
                ys.push(Math.sin(i));
            }
            const minX = Math.round(radius * Math.min(...xs));
            const maxX = Math.round(radius * Math.max(...xs));
            const minY = Math.round(radius * Math.min(...ys));
            const maxY = Math.round(radius * Math.max(...ys));
            return {
                x: minX || 0,
                y: minY || 0,
                width: maxX - minX,
                height: maxY - minY
            };
        }
    }
    Arc.prototype._centroid = true;
    Arc.prototype.className = 'Arc';
    Arc.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
    _registerNode(Arc);
    // add getters setters
    Factory.addGetterSetter(Arc, 'innerRadius', 0, getNumberValidator());
    /**
     * get/set innerRadius
     * @name Konva.Arc#innerRadius
     * @method
     * @param {Number} innerRadius
     * @returns {Number}
     * @example
     * // get inner radius
     * var innerRadius = arc.innerRadius();
     *
     * // set inner radius
     * arc.innerRadius(20);
     */
    Factory.addGetterSetter(Arc, 'outerRadius', 0, getNumberValidator());
    /**
     * get/set outerRadius
     * @name Konva.Arc#outerRadius
     * @method
     * @param {Number} outerRadius
     * @returns {Number}
     * @example
     * // get outer radius
     * var outerRadius = arc.outerRadius();
     *
     * // set outer radius
     * arc.outerRadius(20);
     */
    Factory.addGetterSetter(Arc, 'angle', 0, getNumberValidator());
    /**
     * get/set angle in degrees
     * @name Konva.Arc#angle
     * @method
     * @param {Number} angle
     * @returns {Number}
     * @example
     * // get angle
     * var angle = arc.angle();
     *
     * // set angle
     * arc.angle(20);
     */
    Factory.addGetterSetter(Arc, 'clockwise', false, getBooleanValidator());
    /**
     * get/set clockwise flag
     * @name Konva.Arc#clockwise
     * @method
     * @param {Boolean} clockwise
     * @returns {Boolean}
     * @example
     * // get clockwise flag
     * var clockwise = arc.clockwise();
     *
     * // draw arc counter-clockwise
     * arc.clockwise(false);
     *
     * // draw arc clockwise
     * arc.clockwise(true);
     */
  
    function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = (t * d01) / (d01 + d12), fb = (t * d12) / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    }
    function expandPoints(p, tension) {
        var len = p.length, allPoints = [], n, cp;
        for (n = 2; n < len - 2; n += 2) {
            cp = getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
            if (isNaN(cp[0])) {
                continue;
            }
            allPoints.push(cp[0]);
            allPoints.push(cp[1]);
            allPoints.push(p[n]);
            allPoints.push(p[n + 1]);
            allPoints.push(cp[2]);
            allPoints.push(cp[3]);
        }
        return allPoints;
    }
    /**
     * Line constructor.&nbsp; Lines are defined by an array of points and
     *  a tension
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
     * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     *   The default is 0
     * @param {Boolean} [config.closed] defines whether or not the line shape is closed, creating a polygon or blob
     * @param {Boolean} [config.bezier] if no tension is provided but bezier=true, we draw the line as a bezier using the passed points
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var line = new Konva.Line({
     *   x: 100,
     *   y: 50,
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],
     *   stroke: 'red',
     *   tension: 1
     * });
     */
    class Line extends Shape {
        constructor(config) {
            super(config);
            this.on('pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva', function () {
                this._clearCache('tensionPoints');
            });
        }
        _sceneFunc(context) {
            var points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier(), tp, len, n;
            if (!length) {
                return;
            }
            context.beginPath();
            context.moveTo(points[0], points[1]);
            // tension
            if (tension !== 0 && length > 4) {
                tp = this.getTensionPoints();
                len = tp.length;
                n = closed ? 0 : 4;
                if (!closed) {
                    context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
                }
                while (n < len - 2) {
                    context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
                }
                if (!closed) {
                    context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
                }
            }
            else if (bezier) {
                // no tension but bezier
                n = 2;
                while (n < length) {
                    context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
                }
            }
            else {
                // no tension
                for (n = 2; n < length; n += 2) {
                    context.lineTo(points[n], points[n + 1]);
                }
            }
            // closed e.g. polygons and blobs
            if (closed) {
                context.closePath();
                context.fillStrokeShape(this);
            }
            else {
                // open e.g. lines and splines
                context.strokeShape(this);
            }
        }
        getTensionPoints() {
            return this._getCache('tensionPoints', this._getTensionPoints);
        }
        _getTensionPoints() {
            if (this.closed()) {
                return this._getTensionPointsClosed();
            }
            else {
                return expandPoints(this.points(), this.tension());
            }
        }
        _getTensionPointsClosed() {
            var p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = expandPoints(p, tension), tp = [firstControlPoints[2], firstControlPoints[3]]
                .concat(middle)
                .concat([
                lastControlPoints[0],
                lastControlPoints[1],
                p[len - 2],
                p[len - 1],
                lastControlPoints[2],
                lastControlPoints[3],
                firstControlPoints[0],
                firstControlPoints[1],
                p[0],
                p[1],
            ]);
            return tp;
        }
        getWidth() {
            return this.getSelfRect().width;
        }
        getHeight() {
            return this.getSelfRect().height;
        }
        // overload size detection
        getSelfRect() {
            var points = this.points();
            if (points.length < 4) {
                return {
                    x: points[0] || 0,
                    y: points[1] || 0,
                    width: 0,
                    height: 0,
                };
            }
            if (this.tension() !== 0) {
                points = [
                    points[0],
                    points[1],
                    ...this._getTensionPoints(),
                    points[points.length - 2],
                    points[points.length - 1],
                ];
            }
            else {
                points = this.points();
            }
            var minX = points[0];
            var maxX = points[0];
            var minY = points[1];
            var maxY = points[1];
            var x, y;
            for (var i = 0; i < points.length / 2; i++) {
                x = points[i * 2];
                y = points[i * 2 + 1];
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            };
        }
    }
    Line.prototype.className = 'Line';
    Line.prototype._attrsAffectingSize = ['points', 'bezier', 'tension'];
    _registerNode(Line);
    // add getters setters
    Factory.addGetterSetter(Line, 'closed', false);
    /**
     * get/set closed flag.  The default is false
     * @name Konva.Line#closed
     * @method
     * @param {Boolean} closed
     * @returns {Boolean}
     * @example
     * // get closed flag
     * var closed = line.closed();
     *
     * // close the shape
     * line.closed(true);
     *
     * // open the shape
     * line.closed(false);
     */
    Factory.addGetterSetter(Line, 'bezier', false);
    /**
     * get/set bezier flag.  The default is false
     * @name Konva.Line#bezier
     * @method
     * @param {Boolean} bezier
     * @returns {Boolean}
     * @example
     * // get whether the line is a bezier
     * var isBezier = line.bezier();
     *
     * // set whether the line is a bezier
     * line.bezier(true);
     */
    Factory.addGetterSetter(Line, 'tension', 0, getNumberValidator());
    /**
     * get/set tension
     * @name Konva.Line#tension
     * @method
     * @param {Number} tension Higher values will result in a more curvy line.  A value of 0 will result in no interpolation. The default is 0
     * @returns {Number}
     * @example
     * // get tension
     * var tension = line.tension();
     *
     * // set tension
     * line.tension(3);
     */
    Factory.addGetterSetter(Line, 'points', [], getNumberArrayValidator());
    /**
     * get/set points array. Points is a flat array [x1, y1, x2, y2]. It is flat for performance reasons.
     * @name Konva.Line#points
     * @method
     * @param {Array} points
     * @returns {Array}
     * @example
     * // get points
     * var points = line.points();
     *
     * // set points
     * line.points([10, 20, 30, 40, 50, 60]);
     *
     * // push a new point
     * line.points(line.points().concat([70, 80]));
     */
  
    /**
     * Path constructor.
     * @author Jason Follas
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {String} config.data SVG data string
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var path = new Konva.Path({
     *   x: 240,
     *   y: 40,
     *   data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
     *   fill: 'green',
     *   scaleX: 2,
     *   scaleY: 2
     * });
     */
    class Path extends Shape {
        constructor(config) {
            super(config);
            this.dataArray = [];
            this.pathLength = 0;
            this.dataArray = Path.parsePathData(this.data());
            this.pathLength = 0;
            for (var i = 0; i < this.dataArray.length; ++i) {
                this.pathLength += this.dataArray[i].pathLength;
            }
            this.on('dataChange.konva', function () {
                this.dataArray = Path.parsePathData(this.data());
                this.pathLength = 0;
                for (var i = 0; i < this.dataArray.length; ++i) {
                    this.pathLength += this.dataArray[i].pathLength;
                }
            });
        }
        _sceneFunc(context) {
            var ca = this.dataArray;
            // context position
            context.beginPath();
            var isClosed = false;
            for (var n = 0; n < ca.length; n++) {
                var c = ca[n].command;
                var p = ca[n].points;
                switch (c) {
                    case 'L':
                        context.lineTo(p[0], p[1]);
                        break;
                    case 'M':
                        context.moveTo(p[0], p[1]);
                        break;
                    case 'C':
                        context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                        break;
                    case 'Q':
                        context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                        break;
                    case 'A':
                        var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                        var r = rx > ry ? rx : ry;
                        var scaleX = rx > ry ? 1 : rx / ry;
                        var scaleY = rx > ry ? ry / rx : 1;
                        context.translate(cx, cy);
                        context.rotate(psi);
                        context.scale(scaleX, scaleY);
                        context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                        context.scale(1 / scaleX, 1 / scaleY);
                        context.rotate(-psi);
                        context.translate(-cx, -cy);
                        break;
                    case 'z':
                        isClosed = true;
                        context.closePath();
                        break;
                }
            }
            if (!isClosed && !this.hasFill()) {
                context.strokeShape(this);
            }
            else {
                context.fillStrokeShape(this);
            }
        }
        getSelfRect() {
            var points = [];
            this.dataArray.forEach(function (data) {
                if (data.command === 'A') {
                    // Approximates by breaking curve into line segments
                    var start = data.points[4];
                    // 4 = theta
                    var dTheta = data.points[5];
                    // 5 = dTheta
                    var end = data.points[4] + dTheta;
                    var inc = Math.PI / 180.0;
                    // 1 degree resolution
                    if (Math.abs(start - end) < inc) {
                        inc = Math.abs(start - end);
                    }
                    if (dTheta < 0) {
                        // clockwise
                        for (let t = start - inc; t > end; t -= inc) {
                            const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                            points.push(point.x, point.y);
                        }
                    }
                    else {
                        // counter-clockwise
                        for (let t = start + inc; t < end; t += inc) {
                            const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                            points.push(point.x, point.y);
                        }
                    }
                }
                else if (data.command === 'C') {
                    // Approximates by breaking curve into 100 line segments
                    for (let t = 0.0; t <= 1; t += 0.01) {
                        const point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                        points.push(point.x, point.y);
                    }
                }
                else {
                    // TODO: how can we calculate bezier curves better?
                    points = points.concat(data.points);
                }
            });
            var minX = points[0];
            var maxX = points[0];
            var minY = points[1];
            var maxY = points[1];
            var x, y;
            for (var i = 0; i < points.length / 2; i++) {
                x = points[i * 2];
                y = points[i * 2 + 1];
                // skip bad values
                if (!isNaN(x)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                }
                if (!isNaN(y)) {
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
            return {
                x: Math.round(minX),
                y: Math.round(minY),
                width: Math.round(maxX - minX),
                height: Math.round(maxY - minY),
            };
        }
        /**
         * Return length of the path.
         * @method
         * @name Konva.Path#getLength
         * @returns {Number} length
         * @example
         * var length = path.getLength();
         */
        getLength() {
            return this.pathLength;
        }
        /**
         * Get point on path at specific length of the path
         * @method
         * @name Konva.Path#getPointAtLength
         * @param {Number} length length
         * @returns {Object} point {x,y} point
         * @example
         * var point = path.getPointAtLength(10);
         */
        getPointAtLength(length) {
            var point, i = 0, ii = this.dataArray.length;
            if (!ii) {
                return null;
            }
            while (i < ii && length > this.dataArray[i].pathLength) {
                length -= this.dataArray[i].pathLength;
                ++i;
            }
            if (i === ii) {
                point = this.dataArray[i - 1].points.slice(-2);
                return {
                    x: point[0],
                    y: point[1],
                };
            }
            if (length < 0.01) {
                point = this.dataArray[i].points.slice(0, 2);
                return {
                    x: point[0],
                    y: point[1],
                };
            }
            var cp = this.dataArray[i];
            var p = cp.points;
            switch (cp.command) {
                case 'L':
                    return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
                case 'C':
                    return Path.getPointOnCubicBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);
                case 'Q':
                    return Path.getPointOnQuadraticBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);
                case 'A':
                    var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6];
                    theta += (dTheta * length) / cp.pathLength;
                    return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
            }
            return null;
        }
        static getLineLength(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        }
        static getPointOnLine(dist, P1x, P1y, P2x, P2y, fromX, fromY) {
            if (fromX === undefined) {
                fromX = P1x;
            }
            if (fromY === undefined) {
                fromY = P1y;
            }
            var m = (P2y - P1y) / (P2x - P1x + 0.00000001);
            var run = Math.sqrt((dist * dist) / (1 + m * m));
            if (P2x < P1x) {
                run *= -1;
            }
            var rise = m * run;
            var pt;
            if (P2x === P1x) {
                // vertical line
                pt = {
                    x: fromX,
                    y: fromY + rise,
                };
            }
            else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
                pt = {
                    x: fromX + run,
                    y: fromY + rise,
                };
            }
            else {
                var ix, iy;
                var len = this.getLineLength(P1x, P1y, P2x, P2y);
                // if (len < 0.00000001) {
                //   return {
                //     x: P1x,
                //     y: P1y,
                //   };
                // }
                var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
                u = u / (len * len);
                ix = P1x + u * (P2x - P1x);
                iy = P1y + u * (P2y - P1y);
                var pRise = this.getLineLength(fromX, fromY, ix, iy);
                var pRun = Math.sqrt(dist * dist - pRise * pRise);
                run = Math.sqrt((pRun * pRun) / (1 + m * m));
                if (P2x < P1x) {
                    run *= -1;
                }
                rise = m * run;
                pt = {
                    x: ix + run,
                    y: iy + rise,
                };
            }
            return pt;
        }
        static getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
            function CB1(t) {
                return t * t * t;
            }
            function CB2(t) {
                return 3 * t * t * (1 - t);
            }
            function CB3(t) {
                return 3 * t * (1 - t) * (1 - t);
            }
            function CB4(t) {
                return (1 - t) * (1 - t) * (1 - t);
            }
            var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
            var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
            return {
                x: x,
                y: y,
            };
        }
        static getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
            function QB1(t) {
                return t * t;
            }
            function QB2(t) {
                return 2 * t * (1 - t);
            }
            function QB3(t) {
                return (1 - t) * (1 - t);
            }
            var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
            var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
            return {
                x: x,
                y: y,
            };
        }
        static getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
            var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
            var pt = {
                x: rx * Math.cos(theta),
                y: ry * Math.sin(theta),
            };
            return {
                x: cx + (pt.x * cosPsi - pt.y * sinPsi),
                y: cy + (pt.x * sinPsi + pt.y * cosPsi),
            };
        }
        /*
         * get parsed data array from the data
         *  string.  V, v, H, h, and l data are converted to
         *  L data for the purpose of high performance Path
         *  rendering
         */
        static parsePathData(data) {
            // Path Data Segment must begin with a moveTo
            //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
            //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
            //l (x y)+  Relative lineTo
            //L (x y)+  Absolute LineTo
            //h (x)+    Relative horizontal lineTo
            //H (x)+    Absolute horizontal lineTo
            //v (y)+    Relative vertical lineTo
            //V (y)+    Absolute vertical lineTo
            //z (closepath)
            //Z (closepath)
            //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
            //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
            //q (x1 y1 x y)+       Relative Quadratic Bezier
            //Q (x1 y1 x y)+       Absolute Quadratic Bezier
            //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
            //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
            //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
            //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
            //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
            //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc
            // return early if data is not defined
            if (!data) {
                return [];
            }
            // command string
            var cs = data;
            // command chars
            var cc = [
                'm',
                'M',
                'l',
                'L',
                'v',
                'V',
                'h',
                'H',
                'z',
                'Z',
                'c',
                'C',
                'q',
                'Q',
                't',
                'T',
                's',
                'S',
                'a',
                'A',
            ];
            // convert white spaces to commas
            cs = cs.replace(new RegExp(' ', 'g'), ',');
            // create pipes so that we can split the data
            for (var n = 0; n < cc.length; n++) {
                cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
            }
            // create array
            var arr = cs.split('|');
            var ca = [];
            var coords = [];
            // init context point
            var cpx = 0;
            var cpy = 0;
            var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
            var match;
            for (n = 1; n < arr.length; n++) {
                var str = arr[n];
                var c = str.charAt(0);
                str = str.slice(1);
                coords.length = 0;
                while ((match = re.exec(str))) {
                    coords.push(match[0]);
                }
                // while ((match = re.exec(str))) {
                //   coords.push(match[0]);
                // }
                var p = [];
                for (var j = 0, jlen = coords.length; j < jlen; j++) {
                    // extra case for merged flags
                    if (coords[j] === '00') {
                        p.push(0, 0);
                        continue;
                    }
                    var parsed = parseFloat(coords[j]);
                    if (!isNaN(parsed)) {
                        p.push(parsed);
                    }
                    else {
                        p.push(0);
                    }
                }
                while (p.length > 0) {
                    if (isNaN(p[0])) {
                        // case for a trailing comma before next command
                        break;
                    }
                    var cmd = null;
                    var points = [];
                    var startX = cpx, startY = cpy;
                    // Move var from within the switch to up here (jshint)
                    var prevCmd, ctlPtx, ctlPty; // Ss, Tt
                    var rx, ry, psi, fa, fs, x1, y1; // Aa
                    // convert l, H, h, V, and v to L
                    switch (c) {
                        // Note: Keep the lineTo's above the moveTo's in this switch
                        case 'l':
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'L':
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        // Note: lineTo handlers need to be above this point
                        case 'm':
                            var dx = p.shift();
                            var dy = p.shift();
                            cpx += dx;
                            cpy += dy;
                            cmd = 'M';
                            // After closing the path move the current position
                            // to the the first point of the path (if any).
                            if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                                for (var idx = ca.length - 2; idx >= 0; idx--) {
                                    if (ca[idx].command === 'M') {
                                        cpx = ca[idx].points[0] + dx;
                                        cpy = ca[idx].points[1] + dy;
                                        break;
                                    }
                                }
                            }
                            points.push(cpx, cpy);
                            c = 'l';
                            // subsequent points are treated as relative lineTo
                            break;
                        case 'M':
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'M';
                            points.push(cpx, cpy);
                            c = 'L';
                            // subsequent points are treated as absolute lineTo
                            break;
                        case 'h':
                            cpx += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'H':
                            cpx = p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'v':
                            cpy += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'V':
                            cpy = p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'C':
                            points.push(p.shift(), p.shift(), p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        case 'c':
                            points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 'S':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'C') {
                                ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                ctlPty = cpy + (cpy - prevCmd.points[3]);
                            }
                            points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 's':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'C') {
                                ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                ctlPty = cpy + (cpy - prevCmd.points[3]);
                            }
                            points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 'Q':
                            points.push(p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        case 'q':
                            points.push(cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push(cpx, cpy);
                            break;
                        case 'T':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'Q') {
                                ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                ctlPty = cpy + (cpy - prevCmd.points[1]);
                            }
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'Q';
                            points.push(ctlPtx, ctlPty, cpx, cpy);
                            break;
                        case 't':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'Q') {
                                ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                ctlPty = cpy + (cpy - prevCmd.points[1]);
                            }
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push(ctlPtx, ctlPty, cpx, cpy);
                            break;
                        case 'A':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'A';
                            points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                            break;
                        case 'a':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'A';
                            points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                            break;
                    }
                    ca.push({
                        command: cmd || c,
                        points: points,
                        start: {
                            x: startX,
                            y: startY,
                        },
                        pathLength: this.calcLength(startX, startY, cmd || c, points),
                    });
                }
                if (c === 'z' || c === 'Z') {
                    ca.push({
                        command: 'z',
                        points: [],
                        start: undefined,
                        pathLength: 0,
                    });
                }
            }
            return ca;
        }
        static calcLength(x, y, cmd, points) {
            var len, p1, p2, t;
            var path = Path;
            switch (cmd) {
                case 'L':
                    return path.getLineLength(x, y, points[0], points[1]);
                case 'C':
                    // Approximates by breaking curve into 100 line segments
                    len = 0.0;
                    p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    for (t = 0.01; t <= 1; t += 0.01) {
                        p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                    return len;
                case 'Q':
                    // Approximates by breaking curve into 100 line segments
                    len = 0.0;
                    p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                    for (t = 0.01; t <= 1; t += 0.01) {
                        p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                    return len;
                case 'A':
                    // Approximates by breaking curve into line segments
                    len = 0.0;
                    var start = points[4];
                    // 4 = theta
                    var dTheta = points[5];
                    // 5 = dTheta
                    var end = points[4] + dTheta;
                    var inc = Math.PI / 180.0;
                    // 1 degree resolution
                    if (Math.abs(start - end) < inc) {
                        inc = Math.abs(start - end);
                    }
                    // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                    p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                    if (dTheta < 0) {
                        // clockwise
                        for (t = start - inc; t > end; t -= inc) {
                            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    }
                    else {
                        // counter-clockwise
                        for (t = start + inc; t < end; t += inc) {
                            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    }
                    p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    return len;
            }
            return 0;
        }
        static convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
            // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
            var psi = psiDeg * (Math.PI / 180.0);
            var xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
            var yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
                (Math.cos(psi) * (y1 - y2)) / 2.0;
            var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
            if (lambda > 1) {
                rx *= Math.sqrt(lambda);
                ry *= Math.sqrt(lambda);
            }
            var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
                (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
            if (fa === fs) {
                f *= -1;
            }
            if (isNaN(f)) {
                f = 0;
            }
            var cxp = (f * rx * yp) / ry;
            var cyp = (f * -ry * xp) / rx;
            var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
            var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
            var vMag = function (v) {
                return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
            };
            var vRatio = function (u, v) {
                return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
            };
            var vAngle = function (u, v) {
                return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
            };
            var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
            var u = [(xp - cxp) / rx, (yp - cyp) / ry];
            var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
            var dTheta = vAngle(u, v);
            if (vRatio(u, v) <= -1) {
                dTheta = Math.PI;
            }
            if (vRatio(u, v) >= 1) {
                dTheta = 0;
            }
            if (fs === 0 && dTheta > 0) {
                dTheta = dTheta - 2 * Math.PI;
            }
            if (fs === 1 && dTheta < 0) {
                dTheta = dTheta + 2 * Math.PI;
            }
            return [cx, cy, rx, ry, theta, dTheta, psi, fs];
        }
    }
    Path.prototype.className = 'Path';
    Path.prototype._attrsAffectingSize = ['data'];
    _registerNode(Path);
    /**
     * get/set SVG path data string.  This method
     *  also automatically parses the data string
     *  into a data array.  Currently supported SVG data:
     *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
     * @name Konva.Path#data
     * @method
     * @param {String} data svg path string
     * @returns {String}
     * @example
     * // get data
     * var data = path.data();
     *
     * // set data
     * path.data('M200,100h100v50z');
     */
    Factory.addGetterSetter(Path, 'data');
  
    /**
     * Arrow constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Line
     * @param {Object} config
     * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
     * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     *   The default is 0
     * @param {Number} config.pointerLength Arrow pointer length. Default value is 10.
     * @param {Number} config.pointerWidth Arrow pointer width. Default value is 10.
     * @param {Boolean} config.pointerAtBeginning Do we need to draw pointer on beginning position?. Default false.
     * @param {Boolean} config.pointerAtEnding Do we need to draw pointer on ending position?. Default true.
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var line = new Konva.Line({
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],
     *   stroke: 'red',
     *   tension: 1,
     *   pointerLength : 10,
     *   pointerWidth : 12
     * });
     */
    class Arrow extends Line {
        _sceneFunc(ctx) {
            super._sceneFunc(ctx);
            var PI2 = Math.PI * 2;
            var points = this.points();
            var tp = points;
            var fromTension = this.tension() !== 0 && points.length > 4;
            if (fromTension) {
                tp = this.getTensionPoints();
            }
            var length = this.pointerLength();
            var n = points.length;
            var dx, dy;
            if (fromTension) {
                const lp = [
                    tp[tp.length - 4],
                    tp[tp.length - 3],
                    tp[tp.length - 2],
                    tp[tp.length - 1],
                    points[n - 2],
                    points[n - 1],
                ];
                const lastLength = Path.calcLength(tp[tp.length - 4], tp[tp.length - 3], 'C', lp);
                const previous = Path.getPointOnQuadraticBezier(Math.min(1, 1 - length / lastLength), lp[0], lp[1], lp[2], lp[3], lp[4], lp[5]);
                dx = points[n - 2] - previous.x;
                dy = points[n - 1] - previous.y;
            }
            else {
                dx = points[n - 2] - points[n - 4];
                dy = points[n - 1] - points[n - 3];
            }
            var radians = (Math.atan2(dy, dx) + PI2) % PI2;
            var width = this.pointerWidth();
            if (this.pointerAtEnding()) {
                ctx.save();
                ctx.beginPath();
                ctx.translate(points[n - 2], points[n - 1]);
                ctx.rotate(radians);
                ctx.moveTo(0, 0);
                ctx.lineTo(-length, width / 2);
                ctx.lineTo(-length, -width / 2);
                ctx.closePath();
                ctx.restore();
                this.__fillStroke(ctx);
            }
            if (this.pointerAtBeginning()) {
                ctx.save();
                ctx.beginPath();
                ctx.translate(points[0], points[1]);
                if (fromTension) {
                    dx = (tp[0] + tp[2]) / 2 - points[0];
                    dy = (tp[1] + tp[3]) / 2 - points[1];
                }
                else {
                    dx = points[2] - points[0];
                    dy = points[3] - points[1];
                }
                ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
                ctx.moveTo(0, 0);
                ctx.lineTo(-length, width / 2);
                ctx.lineTo(-length, -width / 2);
                ctx.closePath();
                ctx.restore();
                this.__fillStroke(ctx);
            }
        }
        __fillStroke(ctx) {
            // here is a tricky part
            // we need to disable dash for arrow pointers
            var isDashEnabled = this.dashEnabled();
            if (isDashEnabled) {
                // manually disable dash for head
                // it is better not to use setter here,
                // because it will trigger attr change event
                this.attrs.dashEnabled = false;
                ctx.setLineDash([]);
            }
            ctx.fillStrokeShape(this);
            // restore old value
            if (isDashEnabled) {
                this.attrs.dashEnabled = true;
            }
        }
        getSelfRect() {
            const lineRect = super.getSelfRect();
            const offset = this.pointerWidth() / 2;
            return {
                x: lineRect.x - offset,
                y: lineRect.y - offset,
                width: lineRect.width + offset * 2,
                height: lineRect.height + offset * 2,
            };
        }
    }
    Arrow.prototype.className = 'Arrow';
    _registerNode(Arrow);
    /**
     * get/set pointerLength
     * @name Konva.Arrow#pointerLength
     * @method
     * @param {Number} Length of pointer of arrow. The default is 10.
     * @returns {Number}
     * @example
     * // get length
     * var pointerLength = line.pointerLength();
     *
     * // set length
     * line.pointerLength(15);
     */
    Factory.addGetterSetter(Arrow, 'pointerLength', 10, getNumberValidator());
    /**
     * get/set pointerWidth
     * @name Konva.Arrow#pointerWidth
     * @method
     * @param {Number} Width of pointer of arrow.
     *   The default is 10.
     * @returns {Number}
     * @example
     * // get width
     * var pointerWidth = line.pointerWidth();
     *
     * // set width
     * line.pointerWidth(15);
     */
    Factory.addGetterSetter(Arrow, 'pointerWidth', 10, getNumberValidator());
    /**
     * get/set pointerAtBeginning
     * @name Konva.Arrow#pointerAtBeginning
     * @method
     * @param {Number} Should pointer displayed at beginning of arrow. The default is false.
     * @returns {Boolean}
     * @example
     * // get value
     * var pointerAtBeginning = line.pointerAtBeginning();
     *
     * // set value
     * line.pointerAtBeginning(true);
     */
    Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
    /**
     * get/set pointerAtEnding
     * @name Konva.Arrow#pointerAtEnding
     * @method
     * @param {Number} Should pointer displayed at ending of arrow. The default is true.
     * @returns {Boolean}
     * @example
     * // get value
     * var pointerAtEnding = line.pointerAtEnding();
     *
     * // set value
     * line.pointerAtEnding(false);
     */
    Factory.addGetterSetter(Arrow, 'pointerAtEnding', true);
  
    /**
     * Circle constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Number} config.radius
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * // create circle
     * var circle = new Konva.Circle({
     *   radius: 40,
     *   fill: 'red',
     *   stroke: 'black',
     *   strokeWidth: 5
     * });
     */
    class Circle extends Shape {
        _sceneFunc(context) {
            context.beginPath();
            context.arc(0, 0, this.attrs.radius || 0, 0, Math.PI * 2, false);
            context.closePath();
            context.fillStrokeShape(this);
        }
        getWidth() {
            return this.radius() * 2;
        }
        getHeight() {
            return this.radius() * 2;
        }
        setWidth(width) {
            if (this.radius() !== width / 2) {
                this.radius(width / 2);
            }
        }
        setHeight(height) {
            if (this.radius() !== height / 2) {
                this.radius(height / 2);
            }
        }
    }
    Circle.prototype._centroid = true;
    Circle.prototype.className = 'Circle';
    Circle.prototype._attrsAffectingSize = ['radius'];
    _registerNode(Circle);
    /**
     * get/set radius
     * @name Konva.Circle#radius
     * @method
     * @param {Number} radius
     * @returns {Number}
     * @example
     * // get radius
     * var radius = circle.radius();
     *
     * // set radius
     * circle.radius(10);
     */
    Factory.addGetterSetter(Circle, 'radius', 0, getNumberValidator());
  
    /**
     * Ellipse constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Object} config.radius defines x and y radius
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var ellipse = new Konva.Ellipse({
     *   radius : {
     *     x : 50,
     *     y : 50
     *   },
     *   fill: 'red'
     * });
     */
    class Ellipse extends Shape {
        _sceneFunc(context) {
            var rx = this.radiusX(), ry = this.radiusY();
            context.beginPath();
            context.save();
            if (rx !== ry) {
                context.scale(1, ry / rx);
            }
            context.arc(0, 0, rx, 0, Math.PI * 2, false);
            context.restore();
            context.closePath();
            context.fillStrokeShape(this);
        }
        getWidth() {
            return this.radiusX() * 2;
        }
        getHeight() {
            return this.radiusY() * 2;
        }
        setWidth(width) {
            this.radiusX(width / 2);
        }
        setHeight(height) {
            this.radiusY(height / 2);
        }
    }
    Ellipse.prototype.className = 'Ellipse';
    Ellipse.prototype._centroid = true;
    Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
    _registerNode(Ellipse);
    // add getters setters
    Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);
    /**
     * get/set radius
     * @name Konva.Ellipse#radius
     * @method
     * @param {Object} radius
     * @param {Number} radius.x
     * @param {Number} radius.y
     * @returns {Object}
     * @example
     * // get radius
     * var radius = ellipse.radius();
     *
     * // set radius
     * ellipse.radius({
     *   x: 200,
     *   y: 100
     * });
     */
    Factory.addGetterSetter(Ellipse, 'radiusX', 0, getNumberValidator());
    /**
     * get/set radius x
     * @name Konva.Ellipse#radiusX
     * @method
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get radius x
     * var radiusX = ellipse.radiusX();
     *
     * // set radius x
     * ellipse.radiusX(200);
     */
    Factory.addGetterSetter(Ellipse, 'radiusY', 0, getNumberValidator());
    /**
     * get/set radius y
     * @name Konva.Ellipse#radiusY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get radius y
     * var radiusY = ellipse.radiusY();
     *
     * // set radius y
     * ellipse.radiusY(200);
     */
  
    /**
     * Image constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Image} config.image
     * @param {Object} [config.crop]
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var imageObj = new Image();
     * imageObj.onload = function() {
     *   var image = new Konva.Image({
     *     x: 200,
     *     y: 50,
     *     image: imageObj,
     *     width: 100,
     *     height: 100
     *   });
     * };
     * imageObj.src = '/path/to/image.jpg'
     */
    class Image extends Shape {
        constructor(attrs) {
            super(attrs);
            this.on('imageChange.konva', () => {
                this._setImageLoad();
            });
            this._setImageLoad();
        }
        _setImageLoad() {
            const image = this.image();
            // check is image is already loaded
            if (image && image.complete) {
                return;
            }
            // check is video is already loaded
            if (image && image.readyState === 4) {
                return;
            }
            if (image && image['addEventListener']) {
                image['addEventListener']('load', () => {
                    this._requestDraw();
                });
            }
        }
        _useBufferCanvas() {
            return super._useBufferCanvas(true);
        }
        _sceneFunc(context) {
            const width = this.getWidth();
            const height = this.getHeight();
            const image = this.attrs.image;
            let params;
            if (image) {
                const cropWidth = this.attrs.cropWidth;
                const cropHeight = this.attrs.cropHeight;
                if (cropWidth && cropHeight) {
                    params = [
                        image,
                        this.cropX(),
                        this.cropY(),
                        cropWidth,
                        cropHeight,
                        0,
                        0,
                        width,
                        height,
                    ];
                }
                else {
                    params = [image, 0, 0, width, height];
                }
            }
            if (this.hasFill() || this.hasStroke()) {
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                context.fillStrokeShape(this);
            }
            if (image) {
                context.drawImage.apply(context, params);
            }
        }
        _hitFunc(context) {
            var width = this.width(), height = this.height();
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        getWidth() {
            var _a, _b;
            return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.width;
        }
        getHeight() {
            var _a, _b;
            return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.height;
        }
        /**
         * load image from given url and create `Konva.Image` instance
         * @method
         * @memberof Konva.Image
         * @param {String} url image source
         * @param {Function} callback with Konva.Image instance as first argument
         * @example
         *  Konva.Image.fromURL(imageURL, function(image){
         *    // image is Konva.Image instance
         *    layer.add(image);
         *    layer.draw();
         *  });
         */
        static fromURL(url, callback) {
            var img = Util.createImageElement();
            img.onload = function () {
                var image = new Image({
                    image: img,
                });
                callback(image);
            };
            img.crossOrigin = 'Anonymous';
            img.src = url;
        }
    }
    Image.prototype.className = 'Image';
    _registerNode(Image);
    /**
     * get/set image source. It can be image, canvas or video element
     * @name Konva.Image#image
     * @method
     * @param {Object} image source
     * @returns {Object}
     * @example
     * // get value
     * var image = shape.image();
     *
     * // set value
     * shape.image(img);
     */
    Factory.addGetterSetter(Image, 'image');
    Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
    /**
     * get/set crop
     * @method
     * @name Konva.Image#crop
     * @param {Object} crop
     * @param {Number} crop.x
     * @param {Number} crop.y
     * @param {Number} crop.width
     * @param {Number} crop.height
     * @returns {Object}
     * @example
     * // get crop
     * var crop = image.crop();
     *
     * // set crop
     * image.crop({
     *   x: 20,
     *   y: 20,
     *   width: 20,
     *   height: 20
     * });
     */
    Factory.addGetterSetter(Image, 'cropX', 0, getNumberValidator());
    /**
     * get/set crop x
     * @method
     * @name Konva.Image#cropX
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get crop x
     * var cropX = image.cropX();
     *
     * // set crop x
     * image.cropX(20);
     */
    Factory.addGetterSetter(Image, 'cropY', 0, getNumberValidator());
    /**
     * get/set crop y
     * @name Konva.Image#cropY
     * @method
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get crop y
     * var cropY = image.cropY();
     *
     * // set crop y
     * image.cropY(20);
     */
    Factory.addGetterSetter(Image, 'cropWidth', 0, getNumberValidator());
    /**
     * get/set crop width
     * @name Konva.Image#cropWidth
     * @method
     * @param {Number} width
     * @returns {Number}
     * @example
     * // get crop width
     * var cropWidth = image.cropWidth();
     *
     * // set crop width
     * image.cropWidth(20);
     */
    Factory.addGetterSetter(Image, 'cropHeight', 0, getNumberValidator());
    /**
     * get/set crop height
     * @name Konva.Image#cropHeight
     * @method
     * @param {Number} height
     * @returns {Number}
     * @example
     * // get crop height
     * var cropHeight = image.cropHeight();
     *
     * // set crop height
     * image.cropHeight(20);
     */
  
    // constants
    var ATTR_CHANGE_LIST$2 = [
        'fontFamily',
        'fontSize',
        'fontStyle',
        'padding',
        'lineHeight',
        'text',
        'width',
        'height',
    ], CHANGE_KONVA$1 = 'Change.konva', NONE$1 = 'none', UP = 'up', RIGHT$1 = 'right', DOWN = 'down', LEFT$1 = 'left', 
    // cached variables
    attrChangeListLen$1 = ATTR_CHANGE_LIST$2.length;
    /**
     * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape
     * @constructor
     * @memberof Konva
     * @param {Object} config
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * // create label
     * var label = new Konva.Label({
     *   x: 100,
     *   y: 100,
     *   draggable: true
     * });
     *
     * // add a tag to the label
     * label.add(new Konva.Tag({
     *   fill: '#bbb',
     *   stroke: '#333',
     *   shadowColor: 'black',
     *   shadowBlur: 10,
     *   shadowOffset: [10, 10],
     *   shadowOpacity: 0.2,
     *   lineJoin: 'round',
     *   pointerDirection: 'up',
     *   pointerWidth: 20,
     *   pointerHeight: 20,
     *   cornerRadius: 5
     * }));
     *
     * // add text to the label
     * label.add(new Konva.Text({
     *   text: 'Hello World!',
     *   fontSize: 50,
     *   lineHeight: 1.2,
     *   padding: 10,
     *   fill: 'green'
     *  }));
     */
    class Label extends Group {
        constructor(config) {
            super(config);
            this.on('add.konva', function (evt) {
                this._addListeners(evt.child);
                this._sync();
            });
        }
        /**
         * get Text shape for the label.  You need to access the Text shape in order to update
         * the text properties
         * @name Konva.Label#getText
         * @method
         * @example
         * label.getText().fill('red')
         */
        getText() {
            return this.find('Text')[0];
        }
        /**
         * get Tag shape for the label.  You need to access the Tag shape in order to update
         * the pointer properties and the corner radius
         * @name Konva.Label#getTag
         * @method
         */
        getTag() {
            return this.find('Tag')[0];
        }
        _addListeners(text) {
            var that = this, n;
            var func = function () {
                that._sync();
            };
            // update text data for certain attr changes
            for (n = 0; n < attrChangeListLen$1; n++) {
                text.on(ATTR_CHANGE_LIST$2[n] + CHANGE_KONVA$1, func);
            }
        }
        getWidth() {
            return this.getText().width();
        }
        getHeight() {
            return this.getText().height();
        }
        _sync() {
            var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
            if (text && tag) {
                width = text.width();
                height = text.height();
                pointerDirection = tag.pointerDirection();
                pointerWidth = tag.pointerWidth();
                pointerHeight = tag.pointerHeight();
                x = 0;
                y = 0;
                switch (pointerDirection) {
                    case UP:
                        x = width / 2;
                        y = -1 * pointerHeight;
                        break;
                    case RIGHT$1:
                        x = width + pointerWidth;
                        y = height / 2;
                        break;
                    case DOWN:
                        x = width / 2;
                        y = height + pointerHeight;
                        break;
                    case LEFT$1:
                        x = -1 * pointerWidth;
                        y = height / 2;
                        break;
                }
                tag.setAttrs({
                    x: -1 * x,
                    y: -1 * y,
                    width: width,
                    height: height,
                });
                text.setAttrs({
                    x: -1 * x,
                    y: -1 * y,
                });
            }
        }
    }
    Label.prototype.className = 'Label';
    _registerNode(Label);
    /**
     * Tag constructor.&nbsp; A Tag can be configured
     *  to have a pointer element that points up, right, down, or left
     * @constructor
     * @memberof Konva
     * @param {Object} config
     * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
     *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
     * @param {Number} [config.pointerWidth]
     * @param {Number} [config.pointerHeight]
     * @param {Number} [config.cornerRadius]
     */
    class Tag extends Shape {
        _sceneFunc(context) {
            var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = this.cornerRadius();
            let topLeft = 0;
            let topRight = 0;
            let bottomLeft = 0;
            let bottomRight = 0;
            if (typeof cornerRadius === 'number') {
                topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
            }
            else {
                topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
                topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
                bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
                bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
            }
            context.beginPath();
            context.moveTo(topLeft, 0);
            if (pointerDirection === UP) {
                context.lineTo((width - pointerWidth) / 2, 0);
                context.lineTo(width / 2, -1 * pointerHeight);
                context.lineTo((width + pointerWidth) / 2, 0);
            }
            context.lineTo(width - topRight, 0);
            context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
            if (pointerDirection === RIGHT$1) {
                context.lineTo(width, (height - pointerHeight) / 2);
                context.lineTo(width + pointerWidth, height / 2);
                context.lineTo(width, (height + pointerHeight) / 2);
            }
            context.lineTo(width, height - bottomRight);
            context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
            if (pointerDirection === DOWN) {
                context.lineTo((width + pointerWidth) / 2, height);
                context.lineTo(width / 2, height + pointerHeight);
                context.lineTo((width - pointerWidth) / 2, height);
            }
            context.lineTo(bottomLeft, height);
            context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
            if (pointerDirection === LEFT$1) {
                context.lineTo(0, (height + pointerHeight) / 2);
                context.lineTo(-1 * pointerWidth, height / 2);
                context.lineTo(0, (height - pointerHeight) / 2);
            }
            context.lineTo(0, topLeft);
            context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
            context.closePath();
            context.fillStrokeShape(this);
        }
        getSelfRect() {
            var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
            if (direction === UP) {
                y -= pointerHeight;
                height += pointerHeight;
            }
            else if (direction === DOWN) {
                height += pointerHeight;
            }
            else if (direction === LEFT$1) {
                // ARGH!!! I have no idea why should I used magic 1.5!!!!!!!!!
                x -= pointerWidth * 1.5;
                width += pointerWidth;
            }
            else if (direction === RIGHT$1) {
                width += pointerWidth * 1.5;
            }
            return {
                x: x,
                y: y,
                width: width,
                height: height,
            };
        }
    }
    Tag.prototype.className = 'Tag';
    _registerNode(Tag);
    /**
     * get/set pointer direction
     * @name Konva.Tag#pointerDirection
     * @method
     * @param {String} pointerDirection can be up, right, down, left, or none.  The default is none.
     * @returns {String}
     * @example
     * tag.pointerDirection('right');
     */
    Factory.addGetterSetter(Tag, 'pointerDirection', NONE$1);
    /**
     * get/set pointer width
     * @name Konva.Tag#pointerWidth
     * @method
     * @param {Number} pointerWidth
     * @returns {Number}
     * @example
     * tag.pointerWidth(20);
     */
    Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());
    /**
     * get/set pointer height
     * @method
     * @name Konva.Tag#pointerHeight
     * @param {Number} pointerHeight
     * @returns {Number}
     * @example
     * tag.pointerHeight(20);
     */
    Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());
    /**
     * get/set cornerRadius
     * @name Konva.Tag#cornerRadius
     * @method
     * @param {Number} cornerRadius
     * @returns {Number}
     * @example
     * tag.cornerRadius(20);
     *
     * // set different corner radius values
     * // top-left, top-right, bottom-right, bottom-left
     * tag.cornerRadius([0, 10, 20, 30]);
     */
    Factory.addGetterSetter(Tag, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
  
    /**
     * Rect constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Number} [config.cornerRadius]
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var rect = new Konva.Rect({
     *   width: 100,
     *   height: 50,
     *   fill: 'red',
     *   stroke: 'black',
     *   strokeWidth: 5
     * });
     */
    class Rect extends Shape {
        _sceneFunc(context) {
            var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
            context.beginPath();
            if (!cornerRadius) {
                // simple rect - don't bother doing all that complicated maths stuff.
                context.rect(0, 0, width, height);
            }
            else {
                let topLeft = 0;
                let topRight = 0;
                let bottomLeft = 0;
                let bottomRight = 0;
                if (typeof cornerRadius === 'number') {
                    topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
                }
                else {
                    topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
                    topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
                    bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
                    bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
                }
                context.moveTo(topLeft, 0);
                context.lineTo(width - topRight, 0);
                context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
                context.lineTo(width, height - bottomRight);
                context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
                context.lineTo(bottomLeft, height);
                context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
                context.lineTo(0, topLeft);
                context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
            }
            context.closePath();
            context.fillStrokeShape(this);
        }
    }
    Rect.prototype.className = 'Rect';
    _registerNode(Rect);
    /**
     * get/set corner radius
     * @method
     * @name Konva.Rect#cornerRadius
     * @param {Number} cornerRadius
     * @returns {Number}
     * @example
     * // get corner radius
     * var cornerRadius = rect.cornerRadius();
     *
     * // set corner radius
     * rect.cornerRadius(10);
     *
     * // set different corner radius values
     * // top-left, top-right, bottom-right, bottom-left
     * rect.cornerRadius([0, 10, 20, 30]);
     */
    Factory.addGetterSetter(Rect, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
  
    /**
     * RegularPolygon constructor. Examples include triangles, squares, pentagons, hexagons, etc.
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Number} config.sides
     * @param {Number} config.radius
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var hexagon = new Konva.RegularPolygon({
     *   x: 100,
     *   y: 200,
     *   sides: 6,
     *   radius: 70,
     *   fill: 'red',
     *   stroke: 'black',
     *   strokeWidth: 4
     * });
     */
    class RegularPolygon extends Shape {
        _sceneFunc(context) {
            const points = this._getPoints();
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for (var n = 1; n < points.length; n++) {
                context.lineTo(points[n].x, points[n].y);
            }
            context.closePath();
            context.fillStrokeShape(this);
        }
        _getPoints() {
            const sides = this.attrs.sides;
            const radius = this.attrs.radius || 0;
            const points = [];
            for (var n = 0; n < sides; n++) {
                points.push({
                    x: radius * Math.sin((n * 2 * Math.PI) / sides),
                    y: -1 * radius * Math.cos((n * 2 * Math.PI) / sides),
                });
            }
            return points;
        }
        getSelfRect() {
            const points = this._getPoints();
            var minX = points[0].x;
            var maxX = points[0].y;
            var minY = points[0].x;
            var maxY = points[0].y;
            points.forEach((point) => {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            };
        }
        getWidth() {
            return this.radius() * 2;
        }
        getHeight() {
            return this.radius() * 2;
        }
        setWidth(width) {
            this.radius(width / 2);
        }
        setHeight(height) {
            this.radius(height / 2);
        }
    }
    RegularPolygon.prototype.className = 'RegularPolygon';
    RegularPolygon.prototype._centroid = true;
    RegularPolygon.prototype._attrsAffectingSize = ['radius'];
    _registerNode(RegularPolygon);
    /**
     * get/set radius
     * @method
     * @name Konva.RegularPolygon#radius
     * @param {Number} radius
     * @returns {Number}
     * @example
     * // get radius
     * var radius = shape.radius();
     *
     * // set radius
     * shape.radius(10);
     */
    Factory.addGetterSetter(RegularPolygon, 'radius', 0, getNumberValidator());
    /**
     * get/set sides
     * @method
     * @name Konva.RegularPolygon#sides
     * @param {Number} sides
     * @returns {Number}
     * @example
     * // get sides
     * var sides = shape.sides();
     *
     * // set sides
     * shape.sides(10);
     */
    Factory.addGetterSetter(RegularPolygon, 'sides', 0, getNumberValidator());
  
    var PIx2 = Math.PI * 2;
    /**
     * Ring constructor
     * @constructor
     * @augments Konva.Shape
     * @memberof Konva
     * @param {Object} config
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
     * @param {Boolean} [config.clockwise]
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var ring = new Konva.Ring({
     *   innerRadius: 40,
     *   outerRadius: 80,
     *   fill: 'red',
     *   stroke: 'black',
     *   strokeWidth: 5
     * });
     */
    class Ring extends Shape {
        _sceneFunc(context) {
            context.beginPath();
            context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
            context.moveTo(this.outerRadius(), 0);
            context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
            context.closePath();
            context.fillStrokeShape(this);
        }
        getWidth() {
            return this.outerRadius() * 2;
        }
        getHeight() {
            return this.outerRadius() * 2;
        }
        setWidth(width) {
            this.outerRadius(width / 2);
        }
        setHeight(height) {
            this.outerRadius(height / 2);
        }
    }
    Ring.prototype.className = 'Ring';
    Ring.prototype._centroid = true;
    Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
    _registerNode(Ring);
    /**
     * get/set innerRadius
     * @method
     * @name Konva.Ring#innerRadius
     * @param {Number} innerRadius
     * @returns {Number}
     * @example
     * // get inner radius
     * var innerRadius = ring.innerRadius();
     *
     * // set inner radius
     * ring.innerRadius(20);
     */
    Factory.addGetterSetter(Ring, 'innerRadius', 0, getNumberValidator());
    /**
     * get/set outerRadius
     * @name Konva.Ring#outerRadius
     * @method
     * @param {Number} outerRadius
     * @returns {Number}
     * @example
     * // get outer radius
     * var outerRadius = ring.outerRadius();
     *
     * // set outer radius
     * ring.outerRadius(20);
     */
    Factory.addGetterSetter(Ring, 'outerRadius', 0, getNumberValidator());
  
    /**
     * Sprite constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {String} config.animation animation key
     * @param {Object} config.animations animation map
     * @param {Integer} [config.frameIndex] animation frame index
     * @param {Image} config.image image object
     * @param {Integer} [config.frameRate] animation frame rate
     * @param {String} [config.fill] fill color
       * @param {Image} [config.fillPatternImage] fill pattern image
       * @param {Number} [config.fillPatternX]
       * @param {Number} [config.fillPatternY]
       * @param {Object} [config.fillPatternOffset] object with x and y component
       * @param {Number} [config.fillPatternOffsetX] 
       * @param {Number} [config.fillPatternOffsetY] 
       * @param {Object} [config.fillPatternScale] object with x and y component
       * @param {Number} [config.fillPatternScaleX]
       * @param {Number} [config.fillPatternScaleY]
       * @param {Number} [config.fillPatternRotation]
       * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
       * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientStartPointX]
       * @param {Number} [config.fillLinearGradientStartPointY]
       * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
       * @param {Number} [config.fillLinearGradientEndPointX]
       * @param {Number} [config.fillLinearGradientEndPointY]
       * @param {Array} [config.fillLinearGradientColorStops] array of color stops
       * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientStartPointX]
       * @param {Number} [config.fillRadialGradientStartPointY]
       * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
       * @param {Number} [config.fillRadialGradientEndPointX] 
       * @param {Number} [config.fillRadialGradientEndPointY] 
       * @param {Number} [config.fillRadialGradientStartRadius]
       * @param {Number} [config.fillRadialGradientEndRadius]
       * @param {Array} [config.fillRadialGradientColorStops] array of color stops
       * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
       * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
       * @param {String} [config.stroke] stroke color
       * @param {Number} [config.strokeWidth] stroke width
       * @param {Boolean} [config.fillAfterStrokeEnabled]. Should we draw fill AFTER stroke? Default is false.
       * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
       * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
       * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
       * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
       * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
       * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
       * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
       *  is miter
       * @param {String} [config.lineCap] can be butt, round, or square.  The default
       *  is butt
       * @param {String} [config.shadowColor]
       * @param {Number} [config.shadowBlur]
       * @param {Object} [config.shadowOffset] object with x and y component
       * @param {Number} [config.shadowOffsetX]
       * @param {Number} [config.shadowOffsetY]
       * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
       *  between 0 and 1
       * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
       * @param {Array} [config.dash]
       * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true
  
     * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Boolean} [config.visible]
       * @param {Boolean} [config.listening] whether or not the node is listening for events
       * @param {String} [config.id] unique id
       * @param {String} [config.name] non-unique name
       * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
       * @param {Object} [config.scale] set scale
       * @param {Number} [config.scaleX] set scale x
       * @param {Number} [config.scaleY] set scale y
       * @param {Number} [config.rotation] rotation in degrees
       * @param {Object} [config.offset] offset from center point and rotation point
       * @param {Number} [config.offsetX] set offset x
       * @param {Number} [config.offsetY] set offset y
       * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
       *  the entire stage by dragging any portion of the stage
       * @param {Number} [config.dragDistance]
       * @param {Function} [config.dragBoundFunc]
     * @example
     * var imageObj = new Image();
     * imageObj.onload = function() {
     *   var sprite = new Konva.Sprite({
     *     x: 200,
     *     y: 100,
     *     image: imageObj,
     *     animation: 'standing',
     *     animations: {
     *       standing: [
     *         // x, y, width, height (6 frames)
     *         0, 0, 49, 109,
     *         52, 0, 49, 109,
     *         105, 0, 49, 109,
     *         158, 0, 49, 109,
     *         210, 0, 49, 109,
     *         262, 0, 49, 109
     *       ],
     *       kicking: [
     *         // x, y, width, height (6 frames)
     *         0, 109, 45, 98,
     *         45, 109, 45, 98,
     *         95, 109, 63, 98,
     *         156, 109, 70, 98,
     *         229, 109, 60, 98,
     *         287, 109, 41, 98
     *       ]
     *     },
     *     frameRate: 7,
     *     frameIndex: 0
     *   });
     * };
     * imageObj.src = '/path/to/image.jpg'
     */
    class Sprite extends Shape {
        constructor(config) {
            super(config);
            this._updated = true;
            this.anim = new Animation(() => {
                // if we don't need to redraw layer we should return false
                var updated = this._updated;
                this._updated = false;
                return updated;
            });
            this.on('animationChange.konva', function () {
                // reset index when animation changes
                this.frameIndex(0);
            });
            this.on('frameIndexChange.konva', function () {
                this._updated = true;
            });
            // smooth change for frameRate
            this.on('frameRateChange.konva', function () {
                if (!this.anim.isRunning()) {
                    return;
                }
                clearInterval(this.interval);
                this._setInterval();
            });
        }
        _sceneFunc(context) {
            var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
            if (this.hasFill() || this.hasStroke()) {
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                context.fillStrokeShape(this);
            }
            if (image) {
                if (offsets) {
                    var offset = offsets[anim], ix2 = index * 2;
                    context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
                }
                else {
                    context.drawImage(image, x, y, width, height, 0, 0, width, height);
                }
            }
        }
        _hitFunc(context) {
            var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
            context.beginPath();
            if (offsets) {
                var offset = offsets[anim];
                var ix2 = index * 2;
                context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
            }
            else {
                context.rect(0, 0, width, height);
            }
            context.closePath();
            context.fillShape(this);
        }
        _useBufferCanvas() {
            return super._useBufferCanvas(true);
        }
        _setInterval() {
            var that = this;
            this.interval = setInterval(function () {
                that._updateIndex();
            }, 1000 / this.frameRate());
        }
        /**
         * start sprite animation
         * @method
         * @name Konva.Sprite#start
         */
        start() {
            if (this.isRunning()) {
                return;
            }
            var layer = this.getLayer();
            /*
             * animation object has no executable function because
             *  the updates are done with a fixed FPS with the setInterval
             *  below.  The anim object only needs the layer reference for
             *  redraw
             */
            this.anim.setLayers(layer);
            this._setInterval();
            this.anim.start();
        }
        /**
         * stop sprite animation
         * @method
         * @name Konva.Sprite#stop
         */
        stop() {
            this.anim.stop();
            clearInterval(this.interval);
        }
        /**
         * determine if animation of sprite is running or not.  returns true or false
         * @method
         * @name Konva.Sprite#isRunning
         * @returns {Boolean}
         */
        isRunning() {
            return this.anim.isRunning();
        }
        _updateIndex() {
            var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
            if (index < len - 1) {
                this.frameIndex(index + 1);
            }
            else {
                this.frameIndex(0);
            }
        }
    }
    Sprite.prototype.className = 'Sprite';
    _registerNode(Sprite);
    // add getters setters
    Factory.addGetterSetter(Sprite, 'animation');
    /**
     * get/set animation key
     * @name Konva.Sprite#animation
     * @method
     * @param {String} anim animation key
     * @returns {String}
     * @example
     * // get animation key
     * var animation = sprite.animation();
     *
     * // set animation key
     * sprite.animation('kicking');
     */
    Factory.addGetterSetter(Sprite, 'animations');
    /**
     * get/set animations map
     * @name Konva.Sprite#animations
     * @method
     * @param {Object} animations
     * @returns {Object}
     * @example
     * // get animations map
     * var animations = sprite.animations();
     *
     * // set animations map
     * sprite.animations({
     *   standing: [
     *     // x, y, width, height (6 frames)
     *     0, 0, 49, 109,
     *     