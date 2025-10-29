'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Share2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

export default function QRCodeModal({ isOpen, onClose, shareUrl, userName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    // Create a canvas element to render the QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrCodeElement = document.getElementById('qr-code');
    
    if (qrCodeElement) {
      const svg = qrCodeElement.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const link = document.createElement('a');
          link.download = `${userName}-health-qr-code.png`;
          link.href = canvas.toDataURL();
          link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Health Profile`,
          text: 'Access my health information',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">QR Code for Health Profile</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Scan this QR code to quickly access your health profile
              </p>
              
              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <div id="qr-code">
                    <QRCode
                      value={shareUrl}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Share URL */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Share URL:</p>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-xs text-gray-600 font-mono break-all">{shareUrl}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500 text-center">
              Perfect for emergency situations, healthcare visits, or sharing with family
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
