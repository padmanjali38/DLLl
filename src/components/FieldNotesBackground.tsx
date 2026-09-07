import React from 'react';

/**
 * FieldNotesBackground
 * Clean, lightweight, plain modern background.
 */
export const FieldNotesBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Plain clean background */}
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0B1120]" />
    </div>
  );
};

