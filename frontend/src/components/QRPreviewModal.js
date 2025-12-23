import React from 'react';
import QRCode from 'qrcode.react';

export default function QRPreviewModal({ qrValue, onClose }) {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${qrValue}.png`;
    downloadLink.click();
  };

  const printQR = () => {
    const canvas = document.getElementById('qr-canvas');
    const image = canvas.toDataURL('image/png');

    const win = window.open('');
    win.document.write(`<img src="${image}" style="width:300px"/>`);
    win.print();
    win.close();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>QR Code</h3>

        <QRCode
          id="qr-canvas"
          value={qrValue}
          size={250}
        />

        <div style={{ marginTop: 20 }}>
          <button onClick={downloadQR}>Download</button>
          <button onClick={printQR} style={{ marginLeft: 10 }}>
            Print
          </button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999
};

const modal = {
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  textAlign: 'center'
};
