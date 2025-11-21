/**
 * Adapted from https://github.com/MrFrankel/ruler
 */

// Type definitions
export type Dimension = typeof VERTICAL | typeof HORIZONTAL;
export type Side = 'top' | 'left' | 'right' | 'bottom';
export type CornerSide = 'TL' | 'TR' | 'BL' | 'BR';

export interface RulerOptions {
    container: HTMLElement;
    canvas: HTMLElement;
    rulerHeight?: number;
    fontFamily?: string;
    fontSize?: string;
    strokeStyle?: string;
    fillStyle?: string;
    sides?: Side[];
    cornerSides?: CornerSide[];
    lineWidth?: number;
    enableMouseTracking?: boolean;
    enableToolTip?: boolean;
    cornerIcon?: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface GuideInfo {
    posX: number;
    posY: number;
    dimension: Dimension;
}

export interface RulerAPI {
    VERTICAL: number;
    HORIZONTAL: number;
    getPos: () => Position;
    setPos: (values: Position) => void;
    setScroll: (values: Position) => void;
    setScale: (newScale: number) => void;
    clearGuides: () => void;
    removeGuide: (id: number) => void;
    getGuides: () => GuideInfo[];
    setGuides: (guides: GuideInfo[]) => void;
    constructRulers: (options: RulerOptions) => void;
    toggleRulerVisibility: (val: boolean) => void;
    toggleGuideVisibility: (val: boolean) => void;
    destroy: () => void;
}

export interface RulerInstance {
    getLength: () => number;
    getThickness: () => number;
    getScale: () => number;
    setScale: (newScale: number) => number;
    dimension: Dimension;
    orgPos: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    drawRuler: (rulerLength: number, rulerThickness: number, rulerScale?: number) => void;
    drawPoints: () => void;
    destroy: () => void;
    clearListeners?: (() => void) | null;
}

export interface GuideLineInstance {
    setAsDraggable: DraggableMethods;
    startDrag: (evt?: MouseEvent) => void;
    stopDrag: () => void;
    destroy: () => void;
    curScale: (val?: number) => number;
    assigned: (val?: boolean) => boolean;
    curPosDelta: (val?: number) => number;
    guideLine: HTMLElement;
    dimension: Dimension;
    hide: () => void;
    show: () => void;
}

interface DraggableMethods {
    cv: () => HTMLElement;
    move: (xpos: number, ypos: number) => void;
    startMoving: (evt?: MouseEvent) => void;
    stopMoving: () => void;
}

// Constants
const VERTICAL = 1;
const HORIZONTAL = 2;

export default class Ruler {
    public api: RulerAPI;
    private utils: typeof utils;
    private canvasPointerEvents: string;
    private options: RulerOptions;

    constructor(options: RulerOptions) {
        this.api = this.builder();
        this.utils = utils;
        this.canvasPointerEvents = options.canvas.style.pointerEvents;
        this.options = options;
        this.api.constructRulers(options);
    }

    private builder(): RulerAPI {
        let CUR_DELTA_X = 0;
        let CUR_DELTA_Y = 0;
        let SCROLL_X = 0;
        let SCROLL_Y = 0;
        let CUR_SCALE = 1;

        let options: RulerOptions;
        let rulerz: Record<string, RulerInstance> = {};
        let guides: Array<{ dimension: Dimension; line: GuideLineInstance }> = [];
        let theRulerDOM = document.createElement('div');
        let corners: Array<{ destroy: () => void }> = [];

        const defaultOptions: RulerOptions = {
            rulerHeight: 15,
            fontFamily: 'arial',
            fontSize: '8px',
            strokeStyle: 'gray',
            fillStyle: 'black',
            sides: ['top', 'left'],
            cornerSides: ['TL'],
            lineWidth: 1,
            enableMouseTracking: true,
            enableToolTip: true
        };

        const rotateRuler = (curRuler: RulerInstance, angle: number): void => {
            const rotation = `rotate(${angle}deg)`;
            const origin = this.utils.pixelize(Math.abs(parseInt(curRuler.canvas.style.left))) + ' 100%';
            curRuler.canvas.style.webkitTransform = rotation;
            curRuler.canvas.style.MozTransform = rotation;
            curRuler.canvas.style.OTransform = rotation;
            curRuler.canvas.style.msTransform = rotation;
            curRuler.canvas.style.transform = rotation;
            curRuler.canvas.style.webkitTransformOrigin = origin;
            curRuler.canvas.style.MozTransformOrigin = origin;
            curRuler.canvas.style.OTransformOrigin = origin;
            curRuler.canvas.style.msTransformOrigin = origin;
            curRuler.canvas.style.transformOrigin = origin;
        };

        const positionRuler = (curRuler: RulerInstance, alignment: Side): void => {
            curRuler.canvas.style.left = this.utils.pixelize(-((curRuler.canvas.width / 2) - curRuler.canvas.height));
            switch (alignment) {
                case 'top':
                    curRuler.orgPos = parseInt(curRuler.canvas.style.left);
                    break;
                case 'left':
                    curRuler.canvas.style.top = this.utils.pixelize(-curRuler.canvas.height - 1);
                    curRuler.orgPos = parseInt(curRuler.canvas.style.top);
                    rotateRuler(curRuler, 90);
                    break;
            }
        };

        const attachListeners = (container: HTMLElement, curRul: RulerInstance): void => {
            const mousedown = (e: MouseEvent) => {
                constructGuide(curRul.dimension, e.clientX, e.clientY, e);
            };

            curRul.canvas.addEventListener('mousedown', mousedown);
            curRul.clearListeners = function () {
                curRul.canvas.removeEventListener('mousedown', mousedown);
            };
        };

        const constructGuide = (dimension: Dimension, x: number, y: number, e?: MouseEvent, isSet?: boolean): void => {
            let guideIndex: number | undefined;
            const moveCB = (line: GuideLineInstance, x: number, y: number) => {
                const coor = line.dimension === VERTICAL ? x : y;
                if (!line.assigned()) {
                    if (coor > options.rulerHeight!) {
                        line.assigned(true);
                    }
                    return;
                }

                if (coor < options.rulerHeight!) {
                    guides.some(function (guideLine, index) {
                        if (guideLine.line === line) {
                            guideIndex = index;
                            return true;
                        }
                    });
                    line.destroy();
                    guides.splice(guideIndex!, 1);
                }
            };

            let guide = document.createElement('div');
            const guideStyle = dimension === VERTICAL ? 'rul_lineVer' : 'rul_lineHor';
            const curDelta = dimension === VERTICAL ? CUR_DELTA_X : CUR_DELTA_Y;
            guide.title = 'Double click to delete';
            guide.dataset.id = guides.length.toString();
            this.utils.addClasss(guide, ['rul_line', guideStyle]);
            guide = theRulerDOM.appendChild(guide);

            if (dimension === VERTICAL) {
                guide.style.left = this.utils.pixelize(x - options.container.getBoundingClientRect().left);
                if (isSet) guide.style.left = this.utils.pixelize(Math.round(x / CUR_SCALE + options.rulerHeight! - SCROLL_X));
            } else {
                guide.style.top = this.utils.pixelize(y - options.container.getBoundingClientRect().top);
                if (isSet) guide.style.top = this.utils.pixelize(Math.round(y / CUR_SCALE + options.rulerHeight! - SCROLL_Y));
            }

            guides.push({
                dimension: dimension,
                line: this.guideLine(guide, options.container.querySelector('.rul_wrapper'), dimension, options, curDelta, moveCB, e, CUR_SCALE)
            });
        };

        const constructRuler = (container: HTMLElement, alignment: Side): void => {
            let canvas: HTMLCanvasElement;
            const dimension = alignment === 'left' || alignment === 'right' ? VERTICAL : HORIZONTAL;
            const rulerStyle = dimension === VERTICAL ? 'rul_ruler_Vertical' : 'rul_ruler_Horizontal';
            const element = document.createElement('canvas');

            this.utils.addClasss(element, ['rul_ruler', rulerStyle, 'rul_align_' + alignment]);
            canvas = container.appendChild(element) as HTMLCanvasElement;
            rulerz[alignment] = this.rulerConstructor(canvas, options, dimension);
            rulerz[alignment].drawRuler(container.offsetWidth, options.rulerHeight!);
            positionRuler(rulerz[alignment], alignment);
            attachListeners(container, rulerz[alignment]);
        };

        const constructCorner = (() => {
            const cornerDraw = (container: HTMLElement, side: CornerSide): HTMLElement => {
                const corner = document.createElement('div');
                const cornerStyle = 'rul_corner' + side.toUpperCase();

                corner.title = 'Clear Guide lines';
                this.utils.addClasss(corner, ['rul_corner', cornerStyle, options.cornerIcon!]);
                corner.style.width = this.utils.pixelize(options.rulerHeight! + 1);
                corner.style.height = this.utils.pixelize(options.rulerHeight!);
                corner.style.lineHeight = this.utils.pixelize(options.rulerHeight!);
                return container.appendChild(corner);
            }

            const mousedown = (e: MouseEvent) => {
                e.stopPropagation();
                clearGuides();
            }

            return function (container: HTMLElement, cornerSides: CornerSide[]) {
                cornerSides.forEach(function (side) {
                    const corner = cornerDraw(container, side);
                    corner.addEventListener('mousedown', mousedown);
                    corner.destroy = function () {
                        corner.removeEventListener('mousedown', mousedown);
                        corner.parentNode?.removeChild(corner);
                    };
                    corners.push(corner);
                });
            }
        })();

        const mouseup = (e: MouseEvent) => {
            guides.forEach(function (guide) {
                guide.line.stopDrag();
            });
        };

        const constructRulers = (curOptions: RulerOptions): void => {
            theRulerDOM = this.utils.addClasss(theRulerDOM, 'rul_wrapper');
            options = this.utils.extend(defaultOptions, curOptions);
            theRulerDOM = options.container.appendChild(theRulerDOM);
            options.sides!.forEach(function (side) {
                constructRuler(theRulerDOM, side);
            });
            constructCorner(theRulerDOM, options.cornerSides!);
            options.container.addEventListener('mouseup', mouseup);
        };

        const forEachRuler = (cb: (ruler: RulerInstance, index: number) => void): void => {
            let index = 0;
            for (let rul in rulerz) {
                if (rulerz.hasOwnProperty(rul)) {
                    cb(rulerz[rul], index++);
                }
            }
        };

        const getPos = (): Position => {
            return {
                x: CUR_DELTA_X,
                y: CUR_DELTA_Y
            };
        }

        const setPos = (values: Position): void => {
            let orgX = 0;
            let orgY: number;
            let deltaX = 0;
            let deltaY = 0;

            forEachRuler((curRul) => {
                if (curRul.dimension === VERTICAL) {
                    orgY = parseInt(curRul.canvas.style.top);
                    curRul.canvas.style.top = this.utils.pixelize(curRul.orgPos + parseInt(values.y));
                    deltaY = orgY - parseInt(curRul.canvas.style.top);
                } else {
                    orgX = parseInt(curRul.canvas.style.left);
                    curRul.canvas.style.left = this.utils.pixelize(curRul.orgPos + parseInt(values.x));
                    deltaX = orgX - parseInt(curRul.canvas.style.left);
                }
            });

            guides.forEach((guide) => {
                if (guide.dimension === HORIZONTAL) {
                    guide.line.guideLine.style.top = this.utils.pixelize(parseInt(guide.line.guideLine.style.top) - deltaY);
                    guide.line.curPosDelta(parseInt(values.y));
                } else {
                    guide.line.guideLine.style.left = this.utils.pixelize(parseInt(guide.line.guideLine.style.left) - deltaX);
                    guide.line.curPosDelta(parseInt(values.x));
                }
            });
            CUR_DELTA_X = parseInt(values.x);
            CUR_DELTA_Y = parseInt(values.y);
        };

        const setScroll = (values: Position): void => {
            SCROLL_X = values.x;
            SCROLL_Y = values.y;
        }

        const setScale = (newScale: number): void => {
            let curPos: number, orgDelta: number, curScaleFac: number;
            forEachRuler(function (rul) {
                rul.context.clearRect(0, 0, rul.canvas.width, rul.canvas.height);
                rul.context.beginPath();
                rul.setScale(newScale);
                rul.context.stroke();
                CUR_SCALE = newScale;
            });

            guides.forEach((guide) => {
                if (guide.dimension === HORIZONTAL) {
                    curPos = parseInt(guide.line.guideLine.style.top);
                    orgDelta = options.rulerHeight! + 1;
                    curScaleFac = parseFloat(newScale.toString()) / guide.line.curScale();
                    guide.line.guideLine.style.top = this.utils.pixelize(((curPos - orgDelta - CUR_DELTA_Y) / curScaleFac) + orgDelta + CUR_DELTA_Y);
                    guide.line.curScale(newScale);
                } else {
                    curPos = parseInt(guide.line.guideLine.style.left);
                    orgDelta = options.rulerHeight! + 1;
                    curScaleFac = parseFloat(newScale.toString()) / guide.line.curScale();
                    guide.line.guideLine.style.left = this.utils.pixelize(((curPos - orgDelta - CUR_DELTA_X) / curScaleFac) + orgDelta + CUR_DELTA_X);
                    guide.line.curScale(newScale);
                }
            });
        };

        const clearGuides = (): void => {
            guides.forEach(function (guide) {
                guide.line.destroy();
            });
            guides = [];
        };

        const removeGuide = (id: number): void => {
            const last = guides.length - 1;
            [guides[id], guides[last]] = [guides[last], guides[id]];
            guides.pop();
        };

        const toggleGuideVisibility = (val: boolean): void => {
            const func = val ? 'show' : 'hide';
            guides.forEach(function (guide) {
                (guide.line as any)[func]();
            });
        };

        const toggleRulerVisibility = (val: boolean): void => {
            const state = val ? 'block' : 'none';
            theRulerDOM.style.display = state;
            const trackers = options.container.querySelectorAll('.rul_tracker');
            if (trackers.length > 0) {
                trackers[0].style.display = state;
                trackers[1].style.display = state;
            }
        };

        const getGuides = (): GuideInfo[] => {
            return guides.map(function (guide) {
                return {
                    posX: Math.round((parseInt(guide.line.guideLine.style.left) - options.rulerHeight! + SCROLL_X) * CUR_SCALE),
                    posY: Math.round((parseInt(guide.line.guideLine.style.top) - options.rulerHeight! + SCROLL_Y) * CUR_SCALE),
                    dimension: guide.dimension
                };
            });
        };

        const setGuides = (_guides: GuideInfo[]): void => {
            if (!_guides || !_guides.length) {
                return;
            }
            _guides.forEach(function (guide) {
                constructGuide(guide.dimension, guide.posX, guide.posY, undefined, true);
            });
        };

        const destroy = (): void => {
            clearGuides();
            forEachRuler(function (ruler) {
                ruler.destroy();
            });
            corners.forEach(function (corner) {
                corner.destroy();
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
        };
    }

    private rulerConstructor(_canvas: HTMLCanvasElement, options: RulerOptions, rulDimension: Dimension): RulerInstance {
        const canvas = _canvas;
        const context = canvas.getContext('2d')!;
        let rulThickness = 0;
        let rulLength = 0;
        let rulScale = 1;
        const dimension = rulDimension || HORIZONTAL;
        let orgPos = 0;
        let tracker = document.createElement('div');

        const getLength = (): number => {
            return rulLength;
        };

        const getThickness = (): number => {
            return rulThickness;
        };

        const getScale = (): number => {
            return rulScale;
        };

        const setScale = (newScale: number): number => {
            rulScale = parseFloat(newScale.toString());
            drawPoints();
            return rulScale;
        };

        const drawRuler = (_rulerLength: number, _rulerThickness: number, _rulerScale?: number): void => {
            rulLength = canvas.width = _rulerLength * 4;
            rulThickness = canvas.height = _rulerThickness;
            rulScale = _rulerScale || rulScale;
            context.strokeStyle = options.strokeStyle!;
            context.fillStyle = options.fillStyle!;
            context.font = options.fontSize + ' ' + options.fontFamily;
            context.lineWidth = options.lineWidth!;
            context.beginPath();
            drawPoints();
            context.stroke();
        };

        const drawPoints = (): void => {
            let pointLength = 0;
            let label = '';
            let delta = 0;
            let draw = false;
            const lineLengthMax = rulThickness - 2;
            const lineLengthMed = rulThickness / 2;
            const lineLengthMin = rulThickness / 4;

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

        const mousemove = (e: MouseEvent): void => {
            let x = e.clientX, y = e.clientY;

            if (e.target instanceof HTMLIFrameElement) {
                const zoom = getScale() ** -1;
                x = x * zoom + e.target.getBoundingClientRect().left;
                y = y * zoom + e.target.getBoundingClientRect().top;
            }

            if (dimension === HORIZONTAL) {
                tracker.style.left = this.utils.pixelize(x - options.container.getBoundingClientRect().left);
            } else {
                tracker.style.top = this.utils.pixelize(y - options.container.getBoundingClientRect().top);
            }
        };

        const destroy = (): void => {
            options.container.removeEventListener('mousemove', mousemove);
            tracker.parentNode?.removeChild(tracker);
        };

        const initTracker = (): void => {
            tracker = options.container.appendChild(tracker);
            this.utils.addClasss(tracker, 'rul_tracker');
            const height = this.utils.pixelize(options.rulerHeight!);
            if (dimension === HORIZONTAL) {
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
            destroy,
            clearListeners: null
        };
    }

    /**
     * Created by maor.frankel on 5/23/15.
     */
    private guideLine(
        line: HTMLElement,
        _dragContainer: Element | null,
        lineDimension: Dimension,
        options: RulerOptions,
        curDelta: number,
        movecb: (line: GuideLineInstance, x: number, y: number) => void,
        event?: MouseEvent,
        scale?: number
    ): GuideLineInstance {
        let self: GuideLineInstance;
        const guideLine = line;
        const _curScale = scale || 1;
        let _assigned = false;
        let _curPosDelta = curDelta || 0;
        const dragContainer = _dragContainer;
        const dimension = lineDimension || HORIZONTAL;
        let moveCB = movecb;

        const curPosDelta = (val?: number): number => {
            if (typeof val === 'undefined') {
                return _curPosDelta;
            }
            return (_curPosDelta = val);
        };

        const assigned = (val?: boolean): boolean => {
            if (typeof val === 'undefined') {
                return _assigned;
            }
            return (_assigned = val);
        };

        const curScale = (val?: number): number => {
            if (typeof val === 'undefined') {
                return _curScale;
            }
            return (_curScale = val);
        };

        const draggable = {
            cv: (): HTMLElement => {
                return this.options.canvas;
            },
            move: (xpos: number, ypos: number): void => {
                guideLine.style.left = this.utils.pixelize(xpos);
                guideLine.style.top = this.utils.pixelize(ypos);
                updateToolTip(xpos, ypos);
                moveCB(self, xpos, ypos);
            },
            startMoving: (evt?: MouseEvent): void => {
                draggable.cv().style.pointerEvents = 'none';
                this.utils.addClasss(guideLine, ['rul_line_dragged']);
                const posX = evt?.clientX || 0;
                const posY = evt?.clientY || 0;
                const divTop = parseInt(guideLine.style.top || '0');
                const divLeft = parseInt(guideLine.style.left || '0');
                const eWi = parseInt(guideLine.offsetWidth.toString());
                const eHe = parseInt(guideLine.offsetHeight.toString());
                const cWi = parseInt(dragContainer?.offsetWidth?.toString() || '0');
                const cHe = parseInt(dragContainer?.offsetHeight?.toString() || '0');
                const cursor = dimension === HORIZONTAL ? 'ns-resize' : 'ew-resize';

                options.container.style.cursor = cursor;
                guideLine.style.cursor = cursor;
                const diffX = posX - divLeft;
                const diffY = posY - divTop;
                const movingHandler = (evt: MouseEvent) => {
                    const posX = evt.clientX;
                    const posY = evt.clientY;
                    let aX = posX - diffX;
                    let aY = posY - diffY;

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
                document.onmousemove = movingHandler;
                showToolTip();
            },
            stopMoving: (): void => {
                draggable.cv().style.pointerEvents = this.canvasPointerEvents;
                options.container.style.cursor = '';
                guideLine.style.cursor = '';
                document.onmousemove = null;
                hideToolTip();
                this.utils.removeClasss(guideLine, ['rul_line_dragged']);
            }
        };

        const showToolTip = (): void => {
            if (!options.enableToolTip) {
                return;
            }
            this.utils.addClasss(guideLine, 'rul_tooltip');
        };

        const updateToolTip = (x: number, y: number): void => {
            if (y) {
                guideLine.dataset.tip = Math.round((y - options.rulerHeight! - 1 - _curPosDelta) * _curScale) + 'px';
            } else {
                guideLine.dataset.tip = Math.round((x - options.rulerHeight! - 1 - _curPosDelta) * _curScale) + 'px';
            }
        };

        const hideToolTip = (): void => {
            this.utils.removeClasss(guideLine, 'rul_tooltip');
        };

        const destroy = (): void => {
            draggable.stopMoving();
            moveCB = () => {};
            guideLine.removeEventListener('mousedown', mousedown);
            guideLine.removeEventListener('mouseup', mouseup);
            guideLine.removeEventListener('dblclick', dblclick);
            guideLine.parentNode?.removeChild(guideLine);
        };

        const hide = (): void => {
            guideLine.style.display = 'none';
        };

        const show = (): void => {
            guideLine.style.display = 'block';
        };

        const mousedown = (e: MouseEvent): void => {
            e.stopPropagation();
            draggable.startMoving();
        };

        const mouseup = (e: MouseEvent): void => {
            draggable.stopMoving();
        };

        const dblclick = (e: MouseEvent): void => {
            e.stopPropagation();
            destroy();
            // The guide removal will be handled by the constructGuide function's moveCB
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
        return self;
    }
}

export const utils = {
    extend<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key] as T[Extract<keyof T, string>];
                }
            }
        }
        return target;
    },
    pixelize(val: number | string): string {
        return val.toString() + 'px';
    },
    prependChild(container: HTMLElement, element: HTMLElement): HTMLElement {
        return container.insertBefore(element, container.firstChild);
    },
    addClasss(element: HTMLElement, classNames: string | string[]): HTMLElement {
        const classes = Array.isArray(classNames) ? classNames : [classNames];

        classes.forEach(function (name) {
            element.className += ' ' + name;
        });

        return element;
    },
    removeClasss(element: HTMLElement, classNames: string | string[]): HTMLElement {
        const classes = Array.isArray(classNames) ? classNames : [classNames];
        let curClasses = element.className;

        classes.forEach(function (name) {
            curClasses = curClasses.replace(name, '');
        });
        element.className = curClasses;
        return element;
    }
};