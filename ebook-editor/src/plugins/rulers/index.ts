import Ruler from './Ruler';
import { Editor } from 'grapesjs';
import './rulers.css';

export interface RulersOptions {
    dragMode?: string;
    rulerHeight?: number;
    canvasZoom?: number;
    rulerOpts?: any;
}

export default (editor: Editor, opts: RulersOptions = {}) => {
    const options: RulersOptions = {
        // default options
        dragMode: 'translate',
        rulerHeight: 15,
        canvasZoom: 94,
        rulerOpts: {},
        ...opts
    };

    const cm = editor.Commands;
    const rulH = options.rulerHeight!;
    const defaultDragMode = editor.getConfig('dragMode');
    let zoom = options.canvasZoom!
    let scale = 100 / zoom;
    let rulers: any;

    cm.add('ruler-visibility', {
        run(editor) {
            !rulers && (rulers = new Ruler({
                container: editor.Canvas.getCanvasView().el,
                canvas: editor.Canvas.getFrameEl(),
                rulerHeight: rulH,
                strokeStyle: 'white',
                fillStyle: 'white',
                cornerIcon: 'fa fa-trash',
                ...options.rulerOpts
            })) && editor.on('canvasScroll frame:scroll change:canvasOffset', () => {
                setOffset();
            });
            (editor as any).Rulers = rulers;
            rulers.api.toggleRulerVisibility(true);
            editor.Canvas.setZoom(zoom);
            editor.setDragMode(options.dragMode as any);
            setOffset();
            rulers.api.setScale(scale);
        },
        stop(editor) {
            rulers && rulers.api.toggleRulerVisibility(false);
            editor.Canvas.setZoom(100);
            editor.setDragMode(defaultDragMode as any);
        }
    });

    const setOffset = () => {
        const { top, left } = editor.Canvas.getOffset();
        const scrollX = editor.Canvas.getBody().scrollLeft;
        const scrollY = editor.Canvas.getBody().scrollTop;
        rulers.api.setPos({
            x: left - rulH - scrollX / scale,
            y: top - rulH - scrollY / scale
        });
        rulers.api.setScroll({
            x: scrollX,
            y: scrollY
        });
    }

    cm.add('guides-visibility', {
        run() {
            rulers && rulers.api.toggleGuideVisibility(true);
        },
        stop() {
            rulers && rulers.api.toggleGuideVisibility(false);
        }
    });

    cm.add('get-rulers', () => {
        return rulers;
    });

    cm.add('get-rulers-constructor', () => {
        return Ruler;
    });

    cm.add('clear-guides', () => {
        rulers && rulers.api.clearGuides();
    });

    cm.add('get-guides', () => {
        if (rulers) return rulers.api.getGuides();
        else return 0;
    });

    cm.add('set-guides', (editor: Editor, sender?: any, options: any = {}) => {
        rulers && options.guides && rulers.api.setGuides(options.guides);
    });

    cm.add('set-zoom', (editor: Editor, sender?: any, options: any = {}) => {
        zoom = options.zoom;
        scale = 100 / zoom;
        editor.Canvas.setZoom(zoom);
        setOffset();
        rulers && rulers.api.setScale(scale);
    });

    cm.add('destroy-ruler', () => {
        rulers && rulers.api.destroy();
    });
};
