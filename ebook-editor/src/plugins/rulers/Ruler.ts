/**
 * Adapted from https://github.com/MrFrankel/ruler
 * GrapesJS Rulers Plugin - Local version
 */

export default class Ruler {
    api: any;
    utils: typeof utils;
    canvasPointerEvents: string;
    options: any;

    constructor(options: any = {}) {
        this.api = this.builder();
        this.utils = utils;
        this.canvasPointerEvents = options.canvas.style.pointerEvents;
        this.options = options;
        this.api.constructRulers(options);
    }

    builder() {
        let VERTICAL = 1,
            HORIZONTAL = 2,
            CUR_DELTA_X = 0,
            CUR_DELTA_Y = 0,
            SCROLL_X = 0,
            SCROLL_Y = 0,
            CUR_SCALE = 1;

        let options: any,
            rulerz: any = {},
            guides: any[] = [],
            theRulerDOM = document.createElement('div'),
            corners: any[] = [],
            defaultOptions = {
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

        const rotateRuler = (curRuler: any, angle: number) => {
            const rotation = 'rotate(' + angle + 'deg)';
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

        const positionRuler = (curRuler: any, alignment: string) => {
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

        const attachListeners = (container: any, curRul: any) => {
            const mousedown = function (e: MouseEvent) {
                constructGuide(curRul.dimension, e.clientX, e.clientY, e);
            };

            curRul.canvas.addEventListener('mousedown', mousedown);
            curRul.clearListeners = function () {
                curRul.canvas.removeEventListener('mousedown', mousedown);
            }
        };

        const constructGuide = (dimension: number, x: number, y: number, e?: any, isSet?: boolean) => {
            let guideIndex: number;
            const moveCB = (line: any, x: number, y: number) => {
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

            let guide: any = document.createElement('div'),
                guideStyle = dimension === VERTICAL ? 'rul_lineVer' : 'rul_lineHor',
                curDelta = dimension === VERTICAL ? CUR_DELTA_X : CUR_DELTA_Y;
            guide.title = 'Double click to delete';
            guide.dataset.id = guides.length;
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
                line: this.guideLine(guide, options.container.querySelector('.rul_wrapper'), dimension, options, curDelta, moveCB, e, CUR_SCALE)
            });
        };


        const constructRuler = (container: any, alignment: string) => {
            let canvas: any,
                dimension = alignment === 'left' || alignment === 'right' ? VERTICAL : HORIZONTAL,
                rulerStyle = dimension === VERTICAL ? 'rul_ruler_Vertical' : 'rul_ruler_Horizontal',
                element = document.createElement('canvas');

            this.utils.addClasss(element, ['rul_ruler', rulerStyle, 'rul_align_' + alignment]);
            canvas = container.appendChild(element);
            rulerz[alignment] = this.rulerConstructor(canvas, options, dimension);
            rulerz[alignment].drawRuler(container.offsetWidth, options.rulerHeight);
            positionRuler(rulerz[alignment], alignment);
            attachListeners(container, rulerz[alignment]);
        };

        const constructCorner = (() => {
            const cornerDraw = (container: any, side: string) => {
                const corner = document.createElement('div'),
                    cornerStyle = 'rul_corner' + side.toUpperCase();

                corner.title = 'Clear Guide lines';
                this.utils.addClasss(corner, ['rul_corner', cornerStyle, options.cornerIcon]);
                corner.style.width = this.utils.pixelize(options.rulerHeight + 1);
                corner.style.height = this.utils.pixelize(options.rulerHeight);
                corner.style.lineHeight = this.utils.pixelize(options.rulerHeight);
                return container.appendChild(corner);
            }

            function mousedown(e: MouseEvent) {
                e.stopPropagation();
                clearGuides();
            }

            return function (container: any, cornerSides: string[]) {
                cornerSides.forEach((side) => {
                    const corner: any = cornerDraw(container, side);
                    corner.addEventListener('mousedown', mousedown);
                    corner.destroy = function () {
                        corner.removeEventListener('mousedown', mousedown);
                        corner.parentNode.removeChild(corner);
                    };
                    corners.push(corner);
                })
            }

        })();

        const mouseup = (e: MouseEvent) => {
            guides.forEach((guide) => {
                guide.line.stopDrag();
            })
        };

        const constructRulers = (curOptions: any) => {
            theRulerDOM = this.utils.addClasss(theRulerDOM, 'rul_wrapper');
            options = this.utils.extend(defaultOptions, curOptions);
            theRulerDOM = options.container.appendChild(theRulerDOM);
            options.sides.forEach((side: string) => {
                constructRuler(theRulerDOM, side);
            });
            constructCorner(theRulerDOM, options.cornerSides);
            options.container.addEventListener('mouseup', mouseup);
        };

        const forEachRuler = (cb: Function) => {
            let index = 0;
            for (let rul in rulerz) {
                if (rulerz.hasOwnProperty(rul)) {
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

        const setPos = (values: any) => {
            let orgX = 0,
                orgY: any,
                deltaX = 0,
                deltaY = 0;
            forEachRuler((curRul: any) => {
                if (curRul.dimension === VERTICAL) {
                    orgY = curRul.canvas.style.top;
                    curRul.canvas.style.top = this.utils.pixelize(curRul.orgPos + (parseInt(values.y)));
                    deltaY = parseInt(orgY) - parseInt(curRul.canvas.style.top);
                } else {
                    orgX = curRul.canvas.style.left;
                    curRul.canvas.style.left = this.utils.pixelize(curRul.orgPos + (parseInt(values.x)));
                    deltaX = parseInt(orgX) - parseInt(curRul.canvas.style.left);
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

        const setScroll = (values: any) => {
            SCROLL_X = values.x;
            SCROLL_Y = values.y;
        }

        const setScale = (newScale: number) => {
            let curPos: any, orgDelta: any, curScaleFac: any;
            forEachRuler((rul: any) => {
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
                    curScaleFac = (parseFloat(newScale) / guide.line.curScale());
                    guide.line.guideLine.style.top = this.utils.pixelize(((curPos - orgDelta - CUR_DELTA_Y) / curScaleFac) + orgDelta + CUR_DELTA_Y);
                    guide.line.curScale(newScale);
                } else {
                    curPos = parseInt(guide.line.guideLine.style.left);
                    orgDelta = options.rulerHeight + 1;
                    curScaleFac = (parseFloat(newScale) / guide.line.curScale());
                    guide.line.guideLine.style.left = this.utils.pixelize(((curPos - orgDelta - CUR_DELTA_X) / curScaleFac) + orgDelta + CUR_DELTA_X);
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

        const removeGuide = (id: string) => {
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
                trackers[0].style.display = state;
                trackers[1].style.display = state;
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

        const setGuides = (_guides: any[]) => {
            if (!_guides || !_guides.length) {
                return
            }
            _guides.forEach((guide) => {
                constructGuide(guide.dimension, guide.posX, guide.posY, null, true)
            })
        };

        const destroy = () => {
            clearGuides();
            forEachRuler((ruler: any) => {
                ruler.destroy();
            });
            corners.forEach((corner) => {
                corner.destroy();
            });
            options.container.removeEventListener('mouseup', mouseup);
            theRulerDOM.parentNode.removeChild(theRulerDOM);
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

    rulerConstructor(_canvas: any, options: any, rulDimension: number) {

        let canvas = _canvas,
            context = canvas.getContext('2d'),
            rulThickness = 0,
            rulLength = 0,
            rulScale = 1,
            dimension = rulDimension || 2,
            orgPos = 0,
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
            rulScale = parseFloat(newScale as any);
            drawPoints();
            return rulScale;
        };

        const drawRuler = (_rulerLength: number, _rulerThickness: number, _rulerScale?: number) => {
            rulLength = canvas.width = _rulerLength * 8;
            rulThickness = canvas.height = _rulerThickness;
            rulScale = _rulerScale || rulScale;
            context.strokeStyle = options.strokeStyle;
            context.fillStyle = options.fillStyle;
            context.font = options.fontSize + ' ' + options.fontFamily;
            context.lineWidth = options.lineWidth;
            context.beginPath();
            drawPoints();
            context.stroke();
        };

        const drawPoints = () => {
            let pointLength = 0,
                label = '',
                delta = 0,
                draw = false,
                lineLengthMax = 0,
                lineLengthMed = rulThickness / 2,
                lineLengthMin = rulThickness / 2;

            for (let pos = 0; pos <= rulLength; pos += 1) {
                delta = ((rulLength / 2) - pos);
                draw = false;
                label = '';

                if (delta % 50 === 0) {
                    pointLength = lineLengthMax;
                    label = Math.round(Math.abs(delta) * rulScale) as any;
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

        const mousemove = (e: any) => {
            let x = e.clientX, y = e.clientY;

            if (e.target.tagName === 'IFRAME') {
                const zoom = getScale() ** -1;
                x = x * zoom + e.target.getBoundingClientRect().left;
                y = y * zoom + e.target.getBoundingClientRect().top;
            }

            if (dimension === 2) {
                tracker.style.left = this.utils.pixelize(x - options.container.getBoundingClientRect().left);
            } else {
                tracker.style.top = this.utils.pixelize(y - options.container.getBoundingClientRect().top);
            }
        };

        const destroy = () => {
            options.container.removeEventListener('mousemove', mousemove);
            tracker.parentNode.removeChild(tracker);
            (this as any).clearListeners && (this as any).clearListeners();
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

    guideLine(line: any, _dragContainer: any, lineDimension: number, options: any, curDelta: number, movecb: Function, event?: any, scale?: number) {

        let self: any,
            guideLine = line,
            _curScale = scale || 1,
            _assigned = false,
            _curPosDelta = curDelta || 0,
            dragContainer = _dragContainer,
            dimension = lineDimension || 2,
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
                    return this.options.canvas;
                },
                move: (xpos: number, ypos: number) => {
                    guideLine.style.left = this.utils.pixelize(xpos);
                    guideLine.style.top = this.utils.pixelize(ypos);
                    updateToolTip(xpos, ypos);
                    moveCB(self, xpos, ypos);
                },
                startMoving: (evt?: any) => {
                    draggable.cv().style.pointerEvents = 'none';
                    this.utils.addClasss(guideLine, ['rul_line_dragged']);
                    evt = evt || window.event;
                    let posX = evt ? evt.clientX : 0,
                        posY = evt ? evt.clientY : 0,
                        divTop = parseInt(guideLine.style.top || 0),
                        divLeft = parseInt(guideLine.style.left || 0),
                        eWi = parseInt(guideLine.offsetWidth),
                        eHe = parseInt(guideLine.offsetHeight),
                        cWi = parseInt(dragContainer.offsetWidth),
                        cHe = parseInt(dragContainer.offsetHeight),
                        cursor = dimension === 2 ? 'ns-resize' : 'ew-resize';

                    options.container.style.cursor = cursor;
                    guideLine.style.cursor = cursor;
                    let diffX = posX - divLeft,
                        diffY = posY - divTop;
                    document.onmousemove = function moving(evt) {
                        evt = evt || window.event;
                        let posX = evt.clientX,
                            posY = evt.clientY,
                            aX = posX - diffX,
                            aY = posY - diffY;

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
                    options.container.style.cursor = null;
                    guideLine.style.cursor = null;
                    document.onmousemove = function () { };
                    hideToolTip();
                    this.utils.removeClasss(guideLine, ['rul_line_dragged']);
                }
            }
        })();

        const showToolTip = (e?: any) => {
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

        const hideToolTip = (e?: any) => {
            this.utils.removeClasss(guideLine, 'rul_tooltip');
        };

        const destroy = () => {
            draggable.stopMoving();
            moveCB = null as any;
            guideLine.removeEventListener('mousedown', mousedown);
            guideLine.removeEventListener('mouseup', mouseup);
            guideLine.removeEventListener('dblclick', dblclick);
            guideLine.parentNode && guideLine.parentNode.removeChild(guideLine);
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

        const mouseup = (e: MouseEvent) => {
            draggable.stopMoving();
        };

        const dblclick = (e: MouseEvent) => {
            e.stopPropagation();
            destroy();
            this.api.removeGuide(guideLine.dataset.id);
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
    extend() {
        for (let i = 1; i < arguments.length; i++)
            for (let key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    (arguments[0] as any)[key] = arguments[i][key];
        return arguments[0];
    },
    pixelize(val: number) {
        return val + 'px';
    },
    prependChild(container: any, element: any) {
        return container.insertBefore(element, container.firstChild);
    },
    addClasss(element: any, classNames: string | string[]) {
        if (!(classNames instanceof Array)) {
            classNames = [classNames];
        }

        classNames.forEach(function (name) {
            element.className += ' ' + name;
        });

        return element;
    },
    removeClasss(element: any, classNames: string | string[]) {
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
