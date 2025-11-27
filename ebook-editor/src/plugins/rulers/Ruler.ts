/**
 * Adapted from https://github.com/MrFrankel/ruler
 * GrapesJS Rulers Plugin - Local version
 */

interface RulerOptions {
    canvas?: { style: { pointerEvents: string } };
    container: HTMLElement;
    rulerHeight: number;
    fontFamily: string;
    fontSize: string;
    strokeStyle: string;
    fillStyle: string;
    lineWidth: number;
    sides: string[];
    cornerSides: string[];
    cornerIcon: string;
    enableMouseTracking: boolean;
    enableToolTip: boolean;
}

interface RulerAPI {
    removeGuide: (id: number) => void;
    VERTICAL: number;
    HORIZONTAL: number;
    getPos: () => { x: number; y: number };
    setPos: (values: { x: number; y: number }) => void;
    setScroll: (values: { x: number; y: number }) => void;
    setScale: (newScale: number) => void;
    clearGuides: () => void;
    getGuides: () => { posX: number; posY: number; dimension: number }[];
    setGuides: (guides: { dimension: number; posX: number; posY: number }[]) => void;
    constructRulers: (options: RulerOptions) => void;
    toggleRulerVisibility: (val: boolean) => void;
    toggleGuideVisibility: (val: boolean) => void;
    destroy: () => void;
}

interface RulerInstance {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    dimension: number;
    orgPos: number;
    getLength: () => number;
    getThickness: () => number;
    getScale: () => number;
    setScale: (newScale: number) => number;
    drawRuler: (length: number, thickness: number, scale?: number) => void;
    destroy: () => void;
    clearListeners?: () => void;
}

interface Guide {
    dimension: number;
    line: GuideLine;
}

interface GuideLine {
    guideLine: HTMLElement;
    dimension: number;
    curScale: (val?: number) => number | void;
    assigned: (val?: boolean) => boolean | void;
    curPosDelta: (val?: number) => number | void;
    setAsDraggable: Record<string, unknown>; // Complex draggable object
    startDrag: (evt?: MouseEvent) => void;
    stopDrag: () => void;
    destroy: () => void;
    hide: () => void;
    show: () => void;
}

export default class Ruler {
    api: RulerAPI;
    utils: typeof utils;
    canvasPointerEvents: string;
    options: RulerOptions;

    constructor(options: Partial<RulerOptions> = {}) {
        this.api = this.builder();
        this.utils = utils;

        // Default required options
        const defaultOptions: RulerOptions = {
            canvas: { style: { pointerEvents: 'auto' } },
            container: document.body,
            rulerHeight: 15,
            fontFamily: 'arial',
            fontSize: '8px',
            strokeStyle: 'white',
            fillStyle: 'black',
            lineWidth: 1,
            sides: ['top', 'left'],
            cornerSides: ['TL'],
            cornerIcon: '',
            enableMouseTracking: true,
            enableToolTip: true
        };

        this.options = { ...defaultOptions, ...options };
        this.canvasPointerEvents = this.options.canvas?.style.pointerEvents || 'auto';
        this.api.constructRulers(this.options);
    }

    builder() {
        const VERTICAL = 1,
            HORIZONTAL = 2;
        let CUR_DELTA_X = 0,
            CUR_DELTA_Y = 0,
            SCROLL_X = 0,
            SCROLL_Y = 0,
            CUR_SCALE = 1;

        let options: RulerOptions;
        const rulerz: Record<string, RulerInstance> = {};
        let guides: Guide[] = [];
        let theRulerDOM = document.createElement('div');
        const corners: (HTMLElement & { destroy?: () => void })[] = [];
        const defaultOptions = {
                rulerHeight: 15,
                fontFamily: 'arial',
                fontSize: '8px',
                strokeStyle: 'white',
                sides: ['top', 'left'],
                cornerSides: ['TL'],
                lineWidth: 1,
                enableMouseTracking: true,
                enableToolTip: true
            };

        const rotateRuler = (curRuler: RulerInstance, angle: number) => {
            const rotation = 'rotate(' + angle + 'deg)';
            const origin = this.utils.pixelize(Math.abs(parseInt(curRuler.canvas.style.left))) + ' 100%';
            const canvasStyle = curRuler.canvas.style as CSSStyleDeclaration & {
                webkitTransform?: string;
                MozTransform?: string;
                OTransform?: string;
                msTransform?: string;
                webkitTransformOrigin?: string;
                MozTransformOrigin?: string;
                OTransformOrigin?: string;
                msTransformOrigin?: string;
            };
            canvasStyle.webkitTransform = rotation;
            canvasStyle.MozTransform = rotation;
            canvasStyle.OTransform = rotation;
            canvasStyle.msTransform = rotation;
            canvasStyle.transform = rotation;
            canvasStyle.webkitTransformOrigin = origin;
            canvasStyle.MozTransformOrigin = origin;
            canvasStyle.OTransformOrigin = origin;
            canvasStyle.msTransformOrigin = origin;
            canvasStyle.transformOrigin = origin;
        };

        const positionRuler = (curRuler: RulerInstance, alignment: string) => {
            curRuler.canvas.style.left = this.utils.pixelize(-((curRuler.getLength() / 2) - curRuler.getThickness()));
            switch (alignment) {
                case 'top':
                    curRuler.orgPos = parseInt(curRuler.canvas.style.left);
                    break;
                case 'left':
                    curRuler.canvas.style.top = this.utils.pixelize(-curRuler.getThickness() - 1);
                    curRuler.orgPos = parseInt(curRuler.canvas.style.top);
                    rotateRuler(curRuler, 90);
                    break;
            }
        };

        const attachListeners = (_container: HTMLElement, curRul: RulerInstance) => {
            const mousedown = function (e: MouseEvent) {
                constructGuide(curRul.dimension, e.clientX, e.clientY, e);
            };

            curRul.canvas.addEventListener('mousedown', mousedown);
            curRul.clearListeners = function () {
                curRul.canvas.removeEventListener('mousedown', mousedown);
            }
        };

        const constructGuide = (dimension: number, x: number, y: number, e?: MouseEvent, isSet?: boolean) => {
            let guideIndex: number;
            const moveCB = (line: GuideLine, x: number, y: number) => {
                const coor = line.dimension === VERTICAL ? x : y;
                if (!line.assigned()) {
                    if (coor > options.rulerHeight) {
                        line.assigned(true);
                    }
                    return;
                }

                if (coor < options.rulerHeight) {
                    guides.some((guideLine, index) => {
                        if (guideLine.line === line) {
                            guideIndex = index;
                            return true;
                        }
                    });
                    line.destroy();
                    guides.splice(guideIndex, 1);
                }
            };

            let guide: HTMLElement = document.createElement('div');
            const guideStyle = dimension === VERTICAL ? 'rul_lineVer' : 'rul_lineHor';
            const curDelta = dimension === VERTICAL ? CUR_DELTA_X : CUR_DELTA_Y;
            guide.title = 'Double click to delete';
            guide.dataset.id = guides.length.toString();
            this.utils.addClasss(guide, ['rul_line', guideStyle]);
            guide = theRulerDOM.appendChild(guide);
            if (dimension === VERTICAL) {
                guide.style.left = this.utils.pixelize(x - options.container.getBoundingClientRect().left);
                if (isSet) guide.style.left = this.utils.pixelize(Math.round(x / CUR_SCALE + options.rulerHeight - SCROLL_X));
            } else {
                guide.style.top = this.utils.pixelize(y - options.container.getBoundingClientRect().top);
                if (isSet) guide.style.top = this.utils.pixelize(Math.round(y / CUR_SCALE + options.rulerHeight - SCROLL_Y));
            }
            guides.push({
                dimension: dimension,
                line: this.guideLine(guide, options.container.querySelector('.rul_wrapper')!, dimension, options, curDelta, moveCB, e, CUR_SCALE)
            });
        };


        const constructRuler = (container: HTMLElement, alignment: string) => {
            
            const dimension = alignment === 'left' || alignment === 'right' ? VERTICAL : HORIZONTAL;
            const rulerStyle = dimension === VERTICAL ? 'rul_ruler_Vertical' : 'rul_ruler_Horizontal';
            const element = document.createElement('canvas');

            this.utils.addClasss(element, ['rul_ruler', rulerStyle, 'rul_align_' + alignment]);
            const canvas: HTMLCanvasElement = container.appendChild(element);
            rulerz[alignment] = this.rulerConstructor(canvas, options, dimension);
            rulerz[alignment].drawRuler(container.offsetWidth, options.rulerHeight);
            positionRuler(rulerz[alignment], alignment);
            attachListeners(container, rulerz[alignment]);
        };

        const constructCorner = (() => {
            const cornerDraw = (container: HTMLElement, side: string) => {
                const corner = document.createElement('div');
                const cornerStyle = 'rul_corner' + side.toUpperCase();

                corner.title = 'Clear Guide lines';
                this.utils.addClasss(corner, ['rul_corner', cornerStyle, options.cornerIcon]);
                corner.style.width = this.utils.pixelize(options.rulerHeight + 1);
                corner.style.height = this.utils.pixelize(options.rulerHeight);
                corner.style.lineHeight = this.utils.pixelize(options.rulerHeight);
                corner.style.textAlign = 'center';
                return container.appendChild(corner);
            }

            function mousedown(_e: MouseEvent) {
                _e.stopPropagation();
                clearGuides();
            }

            return function (container: HTMLElement, cornerSides: string[]) {
                cornerSides.forEach((side) => {
                    const corner: HTMLElement & { destroy?: () => void } = cornerDraw(container, side);
                    corner.addEventListener('mousedown', mousedown);
                    corner.destroy = function () {
                        corner.removeEventListener('mousedown', mousedown);
                        corner.parentNode?.removeChild(corner);
                    };
                    corners.push(corner);
                })
            }

        })();

        const mouseup = () => {
            guides.forEach((guide) => {
                guide.line.stopDrag();
            })
        };

        const constructRulers = (curOptions: RulerOptions) => {
            theRulerDOM = this.utils.addClasss(theRulerDOM, 'rul_wrapper') as HTMLDivElement;
            options = { ...defaultOptions, ...curOptions };
            theRulerDOM = options.container.appendChild(theRulerDOM) as HTMLDivElement;
            options.sides.forEach((side: string) => {
                constructRuler(theRulerDOM, side);
            });
            constructCorner(theRulerDOM, options.cornerSides);
            options.container.addEventListener('mouseup', mouseup);
        };

        const forEachRuler = (cb: (ruler: RulerInstance, index: number) => void) => {
            let index = 0;
            for (const rul in rulerz) {
                if (Object.prototype.hasOwnProperty.call(rulerz, rul)) {
                    cb(rulerz[rul], index++);
                }
            }
        };

        const getPos = () => {
            return {
                x: CUR_DELTA_X,
                y: CUR_DELTA_Y
            };
        }

        const setPos = (values: { x: number; y: number }) => {
            let orgX = 0,
                orgY = 0,
                deltaX = 0,
                deltaY = 0;
            forEachRuler((curRul: RulerInstance) => {
                if (curRul.dimension === VERTICAL) {
                    orgY = parseInt(curRul.canvas.style.top) || 0;
                    curRul.canvas.style.top = this.utils.pixelize(curRul.orgPos + values.y);
                    deltaY = orgY - parseInt(curRul.canvas.style.top);
                } else {
                    orgX = parseInt(curRul.canvas.style.left) || 0;
                    curRul.canvas.style.left = this.utils.pixelize(curRul.orgPos + values.x);
                    deltaX = orgX - parseInt(curRul.canvas.style.left);
                }
            });
            guides.forEach((guide) => {
                if (guide.dimension === HORIZONTAL) {
                    guide.line.guideLine.style.top = this.utils.pixelize(parseInt(guide.line.guideLine.style.top) - deltaY);
                    guide.line.curPosDelta(values.y);
                } else {
                    guide.line.guideLine.style.left = this.utils.pixelize(parseInt(guide.line.guideLine.style.left) - deltaX);
                    guide.line.curPosDelta(values.x);
                }
            });
            CUR_DELTA_X = values.x;
            CUR_DELTA_Y = values.y;
        };

        const setScroll = (values: { x: number; y: number }) => {
            SCROLL_X = values.x;
            SCROLL_Y = values.y;
        }

        const setScale = (newScale: number) => {
            let curPos: number, orgDelta: number;
            forEachRuler((rul: RulerInstance) => {
                rul.context.clearRect(0, 0, rul.canvas.width, rul.canvas.height);
                rul.context.beginPath();
                rul.setScale(newScale);
                rul.context.stroke();
                CUR_SCALE = newScale;
            });

            guides.forEach((guide) => {
                if (guide.dimension === HORIZONTAL) {
                    curPos = parseInt(guide.line.guideLine.style.top);
                    orgDelta = options.rulerHeight + 1;
                    const curScaleFac = (parseFloat(newScale.toString()) / (guide.line.curScale() as number));
                    guide.line.guideLine.style.top = this.utils.pixelize(Math.round(((curPos - orgDelta - CUR_DELTA_Y) / curScaleFac) + orgDelta + CUR_DELTA_Y));
                    guide.line.curScale(newScale);
                } else {
                    curPos = parseInt(guide.line.guideLine.style.left);
                    orgDelta = options.rulerHeight + 1;
                    const curScaleFac = (parseFloat(newScale.toString()) / (guide.line.curScale() as number));
                    guide.line.guideLine.style.left = this.utils.pixelize(Math.round(((curPos - orgDelta - CUR_DELTA_X) / curScaleFac) + orgDelta + CUR_DELTA_X));
                    guide.line.curScale(newScale);
                }
            });
        };


        const clearGuides = () => {
            guides.forEach((guide) => {
                guide.line.destroy();
            });
            guides = [];
        };

        const removeGuide = (id: number) => {
            const last = guides.length - 1;
            [guides[id], guides[last]] = [guides[last], guides[id]];
            guides.pop();
        };

        const toggleGuideVisibility = (val: boolean) => {
            const func = val ? 'show' : 'hide';
            guides.forEach((guide) => {
                guide.line[func]();
            });
        };

        const toggleRulerVisibility = (val: boolean) => {
            const state = val ? 'block' : 'none';
            theRulerDOM.style.display = state;
            const trackers = options.container.querySelectorAll('.rul_tracker');
            if (trackers.length > 0) {
                (trackers[0] as HTMLElement).style.display = state;
                (trackers[1] as HTMLElement).style.display = state;
            }
        };

        const getGuides = () => {
            return guides.map((guide) => {
                return {
                    posX: Math.round((parseInt(guide.line.guideLine.style.left) - options.rulerHeight + SCROLL_X) * CUR_SCALE),
                    posY: Math.round((parseInt(guide.line.guideLine.style.top) - options.rulerHeight + SCROLL_Y) * CUR_SCALE),
                    dimension: guide.dimension
                }
            });
        };

        const setGuides = (_guides: { dimension: number; posX: number; posY: number }[]) => {
            if (!_guides || !_guides.length) {
                return
            }
            _guides.forEach((guide) => {
                constructGuide(guide.dimension, guide.posX, guide.posY, undefined, true)
            })
        };

        const destroy = () => {
            clearGuides();
            forEachRuler((ruler: RulerInstance) => {
                ruler.destroy();
            });
            corners.forEach((corner) => {
                if (corner.destroy) corner.destroy();
            });
            options.container.removeEventListener('mouseup', mouseup);
            theRulerDOM.parentNode?.removeChild(theRulerDOM);
        };

        return {
            VERTICAL,
            HORIZONTAL,
            getPos,
            setPos,
            setScroll,
            setScale,
            clearGuides,
            removeGuide,
            getGuides,
            setGuides,
            constructRulers,
            toggleRulerVisibility,
            toggleGuideVisibility,
            destroy
        }
    }

    rulerConstructor(_canvas: HTMLCanvasElement, options: RulerOptions, rulDimension: number) {

        const canvas = _canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Cannot get 2D context');

        const  dimension = rulDimension || 2,
            orgPos = 0;
        let rulThickness = 0,
            rulLength = 0,
            rulScale = 1,
            tracker = document.createElement('div');

        const getLength = () => {
            return rulLength;
        };

        const getThickness = () => {
            return rulThickness;
        };

        const getScale = () => {
            return rulScale;
        };

        const setScale = (newScale: number) => {
            rulScale = newScale;
            drawPoints();
            return rulScale;
        };

        const drawRuler = (_rulerLength: number, _rulerThickness: number, _rulerScale?: number) => {
            const dpr = window.devicePixelRatio || 1;
            rulLength = _rulerLength * 8;
            rulThickness = _rulerThickness;
            rulScale = _rulerScale || rulScale;

            // Set physical canvas size (scaled)
            canvas.width = rulLength * dpr;
            canvas.height = rulThickness * dpr;

            // Set logical canvas size (CSS)
            canvas.style.width = rulLength + 'px';
            canvas.style.height = rulThickness + 'px';

            if (context) {
                context.strokeStyle = options.strokeStyle;
                context.fillStyle = options.fillStyle;
                context.font = options.fontSize + ' ' + options.fontFamily;
                context.lineWidth = options.lineWidth;

                // Scale the context to match DPR
                context.scale(dpr, dpr);

                context.beginPath();
                drawPoints();
                context.stroke();
            }
        };

        const drawPoints = () => {
            let pointLength = 0,
                label = '',
                delta = 0,
                draw = false;
            const lineLengthMax = 0,
                lineLengthMed = rulThickness / 2,
                lineLengthMin = rulThickness / 2;

            for (let pos = 0; pos <= rulLength; pos += 1) {
                delta = ((rulLength / 2) - pos);
                draw = false;
                label = '';

                if (delta % 50 === 0) {
                    pointLength = lineLengthMax;
                    label = Math.round(Math.abs(delta) * rulScale).toString();
                    draw = true;
                } else if (delta % 25 === 0) {
                    pointLength = lineLengthMed;
                    draw = true;
                } else if (delta % 5 === 0) {
                    pointLength = lineLengthMin;
                    draw = true;
                }
                if (draw) {
                    context.moveTo(pos + 0.5, rulThickness + 0.5);
                    context.lineTo(pos + 0.5, pointLength + 0.5);
                    context.fillText(label, pos + 1.5, (rulThickness / 2) + 1);
                }
            }
        };

        const mousemove = (e: MouseEvent) => {
            let x = e.clientX, y = e.clientY;

            if (e.target && (e.target as Element).tagName === 'IFRAME') {
                const zoom = getScale() ** -1;
                const targetElement = e.target as Element;
                x = x * zoom + targetElement.getBoundingClientRect().left;
                y = y * zoom + targetElement.getBoundingClientRect().top;
            }

            if (dimension === 2) {
                tracker.style.left = this.utils.pixelize(x - options.container.getBoundingClientRect().left);
            } else {
                tracker.style.top = this.utils.pixelize(y - options.container.getBoundingClientRect().top);
            }
        };

        const destroy = () => {
            options.container.removeEventListener('mousemove', mousemove);
            tracker.parentNode?.removeChild(tracker);
            const rulerWithListeners = this as { clearListeners?: () => void };
            if (rulerWithListeners.clearListeners) {
                rulerWithListeners.clearListeners();
            }
        };

        const initTracker = () => {
            tracker = options.container.appendChild(tracker);
            this.utils.addClasss(tracker, 'rul_tracker');
            const height = this.utils.pixelize(options.rulerHeight);
            if (dimension === 2) {
                tracker.style.height = height;
            } else {
                tracker.style.width = height;
            }
            options.container.addEventListener('mousemove', mousemove);
        };

        if (options.enableMouseTracking) {
            initTracker();
        }

        return {
            getLength,
            getThickness,
            getScale,
            setScale,
            dimension,
            orgPos,
            canvas,
            context,
            drawRuler,
            drawPoints,
            destroy
        }
    }

    guideLine(line: HTMLElement, _dragContainer: HTMLElement, lineDimension: number, options: RulerOptions, curDelta: number, movecb: (line: GuideLine, x: number, y: number) => void, event?: MouseEvent, scale?: number) {

        const 
            guideLine = line,
            dragContainer = _dragContainer,
            dimension = lineDimension || 2;
        let    
            self: GuideLine | null = null,
            _curScale = scale || 1,
            _assigned = false,
            _curPosDelta = curDelta || 0,
            moveCB = movecb || function () { };

        const curPosDelta = (val?: number) => {
            if (typeof val === 'undefined') {
                return _curPosDelta;
            }
            return (_curPosDelta = val);
        };

        const assigned = (val?: boolean) => {
            if (typeof val === 'undefined') {
                return _assigned;
            }
            return (_assigned = val);
        };

        const curScale = (val?: number) => {
            if (typeof val === 'undefined') {
                return _curScale;
            }
            return (_curScale = val);
        };

        const draggable = (() => {
            return {
                cv: () => {
                    return this.options.canvas || document.body;
                },
                move: (xpos: number, ypos: number) => {
                    guideLine.style.left = this.utils.pixelize(xpos);
                    guideLine.style.top = this.utils.pixelize(ypos);
                    updateToolTip(xpos, ypos);
                    if (self) {
                        moveCB(self, xpos, ypos);
                    }
                },
                startMoving: (evt?: MouseEvent) => {
                    draggable.cv().style.pointerEvents = 'none';
                    this.utils.addClasss(guideLine, ['rul_line_dragged']);
                    evt = evt || window.event as MouseEvent;
                    const posX = evt ? evt.clientX : 0;
                    const posY = evt ? evt.clientY : 0;
                    const divTop = parseInt(guideLine.style.top || '0');
                    const divLeft = parseInt(guideLine.style.left || '0');
                    const eWi = guideLine.offsetWidth;
                    const eHe = guideLine.offsetHeight;
                    const cWi = dragContainer.offsetWidth;
                    const cHe = dragContainer.offsetHeight;
                    const cursor = dimension === 2 ? 'ns-resize' : 'ew-resize';

                    options.container.style.cursor = cursor;
                    guideLine.style.cursor = cursor;
                    const diffX = posX - divLeft;
                    const diffY = posY - divTop;
                    document.onmousemove = function moving(evt) {
                        evt = evt || window.event;
                        const currentPosX = evt.clientX;
                        const currentPosY = evt.clientY;
                        let aX = currentPosX - diffX;
                        let aY = currentPosY - diffY;

                        if (aX < 0) {
                            aX = 0;
                        }
                        if (aY < 0) {
                            aY = 0;
                        }

                        if (aX + eWi > cWi) {
                            aX = cWi - eWi;
                        }
                        if (aY + eHe > cHe) {
                            aY = cHe - eHe;
                        }

                        draggable.move(aX, aY);
                    };
                    showToolTip();
                },
                stopMoving: () => {
                    draggable.cv().style.pointerEvents = this.canvasPointerEvents;
                    options.container.style.cursor = '';
                    guideLine.style.cursor = '';
                    document.onmousemove = function () { };
                    hideToolTip();
                    this.utils.removeClasss(guideLine, ['rul_line_dragged']);
                }
            }
        })();

        const showToolTip = () => {
            if (!options.enableToolTip) {
                return;
            }
            this.utils.addClasss(guideLine, 'rul_tooltip');
        };

        const updateToolTip = (x: number, y: number) => {
            if (y) {
                guideLine.dataset.tip = Math.round((y - options.rulerHeight - 1 - _curPosDelta) * _curScale) + 'px';
            } else {
                guideLine.dataset.tip = Math.round((x - options.rulerHeight - 1 - _curPosDelta) * _curScale) + 'px';
            }
        };

        const hideToolTip = () => {
            this.utils.removeClasss(guideLine, 'rul_tooltip');
        };

        const destroy = () => {
            draggable.stopMoving();
            moveCB = () => {};
            guideLine.removeEventListener('mousedown', mousedown);
            guideLine.removeEventListener('mouseup', mouseup);
            guideLine.removeEventListener('dblclick', dblclick);
            guideLine.parentNode?.removeChild(guideLine);
        };

        const hide = () => {
            guideLine.style.display = 'none';
        };

        const show = () => {
            guideLine.style.display = 'block';
        };

        const mousedown = (e: MouseEvent) => {
            e.stopPropagation();
            draggable.startMoving();
        };

        const mouseup = () => {
            draggable.stopMoving();
        };

        const dblclick = (e: MouseEvent) => {
            e.stopPropagation();
            destroy();
            this.api.removeGuide(parseInt(guideLine.dataset.id || '0'));
        };

        guideLine.addEventListener('mousedown', mousedown);

        guideLine.addEventListener('mouseup', mouseup);

        guideLine.addEventListener('dblclick', dblclick);
        if (event) draggable.startMoving(event);

        self = {
            setAsDraggable: draggable,
            startDrag: draggable.startMoving,
            stopDrag: draggable.stopMoving,
            destroy: destroy,
            curScale: curScale,
            assigned: assigned,
            curPosDelta: curPosDelta,
            guideLine: guideLine,
            dimension: dimension,
            hide: hide,
            show: show
        };
        return self as GuideLine;
    }
}

export const utils = {
    extend(target: Record<string, unknown>, ...sources: Record<string, unknown>[]) {
        if (!target) return {};
        for (const source of sources) {
            if (!source) continue;
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    (target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[key];
                }
            }
        }
        return target;
    },
    pixelize(val: number) {
        return val + 'px';
    },
    prependChild(container: HTMLElement, element: HTMLElement) {
        return container.insertBefore(element, container.firstChild);
    },
    addClasss(element: HTMLElement, classNames: string | string[]) {
        if (!(classNames instanceof Array)) {
            classNames = [classNames];
        }

        classNames.forEach(function (name) {
            element.className += ' ' + name;
        });

        return element;
    },
    removeClasss(element: HTMLElement, classNames: string | string[]) {
        let curCalsss = element.className;
        if (!(classNames instanceof Array)) {
            classNames = [classNames];
        }

        classNames.forEach(function (name) {
            curCalsss = curCalsss.replace(name, '');
        });
        element.className = curCalsss;
        return element;
    }
}
