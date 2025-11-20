import React from 'react';
import type { Editor } from 'grapesjs';

interface ZoomControlsProps {
  editor: Editor;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ editor }) => {
  const [zoom, setZoom] = React.useState(100);

  React.useEffect(() => {
    const updateZoom = () => {
      const canvas = editor.Canvas;
      if (canvas) {
          setZoom(Math.round(canvas.getZoom() * 100));
      }
    };

    editor.on('canvas:zoom', updateZoom);
    return () => {
      editor.off('canvas:zoom', updateZoom);
    };
  }, [editor]);

  const handleZoom = (value: number) => {
    editor.Canvas.setZoom(value / 100);
  };

  const fitToPage = () => {
    // Calculate zoom to fit page height in viewport
    // const canvas = editor.Canvas;
    // const frameEl = canvas.getFrameEl();
    // const viewportHeight = canvas.getBody().clientHeight; 
    
    // Simplified approach for now:
    editor.Canvas.setZoom(1); 
  };

  const fitToWidth = () => {
     // TODO: Implement fit to width
     editor.Canvas.setZoom(1);
  };

  return (
    <div className="zoom-controls">
      <button 
        onClick={() => handleZoom(zoom - 10)}
        title="Zoom Out"
      >
        -
      </button>
      <span>{zoom}%</span>
      <button 
        onClick={() => handleZoom(zoom + 10)}
        title="Zoom In"
      >
        +
      </button>
      <div className="separator"></div>
      <button 
        className="text-btn"
        onClick={fitToPage}
      >
        Fit Page
      </button>
      <button 
        className="text-btn"
        onClick={fitToWidth}
      >
        Fit Width
      </button>
    </div>
  );
};
