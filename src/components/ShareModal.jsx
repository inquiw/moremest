import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Copy, Check, Share2, Download } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.querySelector('#share-url-input');
      if (input) { input.select(); document.execCommand('copy'); }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    }
  }, [title, url]);

  const downloadQR = useCallback(() => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const canvas = document.createElement('canvas');
    const padding = 40;
    const size = 512;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'qr-code-moremest.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  }, []);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
        {/* Mobile backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 sm:absolute sm:inset-auto sm:top-14 sm:right-0 sm:translate-y-0 w-auto sm:w-[320px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/10">
            <p className="text-sm font-body font-semibold text-white">Поделиться</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-4">
            <div className="bg-white p-3 rounded-xl">
              <QRCode
                id="qr-code-svg"
                value={url}
                size={140}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* URL input */}
          <div className="px-4 pb-3">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={url}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-body outline-none focus:border-ocean-500/50 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ocean-500 hover:bg-ocean-400 text-white text-xs font-body font-medium transition-all duration-300"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Скопировано' : 'Скопировать'}
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-body font-medium transition-all duration-300"
              >
                <Share2 size={14} />
                Ещё
              </button>
            )}
          </div>

          {/* Download QR */}
          <div className="px-4 pb-4">
            <button
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs font-body font-medium transition-all duration-300"
            >
              <Download size={14} />
              Скачать QR для печати
            </button>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
