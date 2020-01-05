import React from 'react';

const Alert = ({ children }) => {
  return (
    <div
      style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: 12 }}
    >
      {children}
    </div>
  );
};

export { Alert };
