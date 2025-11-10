import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const NewPage = () => {
  const [text, setText] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>QR Code Generator</h2>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to generate QR code"
        style={{ padding: '10px', fontSize: '16px', width: '300px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <QRCodeSVG value={text || ' '} size={200} />
      </div>
    </div>
  );
};

export default NewPage; 