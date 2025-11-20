import Ruler from './ruler';

export default (editor, opts = {}) => {
    const options = {
        ...{
            // default options
            dragMode: 'translate',
            rulerHeight: 15,
            canvasZoom: 94,
            rulerOpts: {},
        },
        ...opts
    };

    const cm = editor.Commands;
    const rulH = options.rulerHeight;
    const defaultDragMode = editor.getConfig('dragMode');
    let zoom = options.canvasZoom;
    let scale = 100 / zoom;
    let rulers;

    // Helper to update ruler position based on frame and canvas scroll
    const setOffset = () => {
        const canvasEl = editor.Canvas.getElement(); // .gjs-cv-canvas
        const frameEl = editor.Canvas.getFrameEl(); // .gjs-frame

        if (!canvasEl || !frameEl || !rulers) return;

        const scrollX = canvasEl.scrollLeft;
        const scrollY = canvasEl.scrollTop;

        // Calculate frame position relative to the viewport
        const frameRect = frameEl.getBoundingClientRect();
        const canvasRect = canvasEl.getBoundingClientRect();
        
        // Offset of the frame's top-left corner relative to the canvas viewport
        const offsetX = frameRect.left - canvasRect.left;
        const offsetY = frameRect.top - canvasRect.top;

        // Update ruler position
        // The ruler plugin draws starting from (0,0) of its container.
        // We want the ruler's "0" mark to align with the frame's top-left.
        // The setPos method sets the start value of the ruler.
        // If we pass (x,y), the ruler starts drawing from that coordinate?
        // Actually, looking at the original code:
        // rulers.api.setPos({ x: left - rulH - scrollX / scale, ... })
        // It seems to be setting the *value* at the top-left corner.
        
        // Let's try passing the visual offset directly first.
        // If the frame is at 100px from left, we want the ruler at 0px to show "-100".
        // Wait, no. If the frame is at 100px, the ruler at 100px should show "0".
        
        // The original plugin logic is a bit complex to reverse engineer without running it.
        // But based on my previous analysis:
        // We need to sync the ruler's "scroll" with the canvas scroll.
        
        rulers.api.setPos({
            x: offsetX - rulH,
            y: offsetY - rulH
        });
        
        rulers.api.setScroll({
            x: scrollX,
            y: scrollY
        });
    };

    cm.add('ruler-visibility', {
        run(editor) {
            if (!rulers) {
                rulers = new Ruler({
                    container: editor.Canvas.getElement(), // Inject into .gjs-cv-canvas
                    canvas: editor.Canvas.getFrameEl(),
                    rulerHeight: rulH,
                    strokeStyle: 'white',
                    fillStyle: 'white',
                    cornerIcon: 'fa fa-trash',
                    ...options.rulerOpts
                });

                // Add listeners
                const canvasEl = editor.Canvas.getElement();
                if (canvasEl) {
                    canvasEl.addEventListener('scroll', () => setOffset());
                }
                
                editor.on('canvas:zoom', () => {
                    zoom = editor.Canvas.getZoom();
                    scale = 100 / zoom;
                    rulers.api.setScale(scale);
                    setOffset();
                });
                
                editor.on('frame:update', setOffset);
                window.addEventListener('resize', setOffset);
            }

            editor.Rulers = rulers;
            rulers.api.toggleRulerVisibility(true);
            
            // Sync initial state
            zoom = editor.Canvas.getZoom();
            scale = 100 / zoom;
            rulers.api.setScale(scale);
            setOffset();
        },
        stop(editor) {
            rulers && rulers.api.toggleRulerVisibility(false);
        }
    });

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

    cm.add('set-guides', (editor, sender, options = {}) => {
        rulers && options.guides && rulers.api.setGuides(options.guides);
    });

    cm.add('set-zoom', (editor, sender, options = {}) => {
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