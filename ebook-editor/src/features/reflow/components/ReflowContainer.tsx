import React from 'react';
import { useReflowSettings } from '../hooks/useReflowSettings';
import '../styles/reflow.css';

interface ReflowContainerProps {
  children?: React.ReactNode;
  content?: string; // HTML content if passing directly
}

export const ReflowContainer: React.FC<ReflowContainerProps> = ({ children, content }) => {
  const { settings } = useReflowSettings();

  const containerStyles: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily,
    backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : settings.theme === 'sepia' ? '#f4ecd8' : '#ffffff',
    color: settings.theme === 'dark' ? '#e0e0e0' : settings.theme === 'sepia' ? '#5b4636' : '#333333',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px',
    minHeight: '100%',
    transition: 'all 0.3s ease',
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-100 p-8">
      <div 
        className="shadow-lg rounded-lg min-h-[800px]"
        style={containerStyles}
      >
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
