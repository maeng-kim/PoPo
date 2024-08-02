import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptureContext from '../contexts/CaptureContext';
import StickerPanel from './StickerPanel';
import '../asset/DecoView.scss';

function DecoView() {
  const { capturedImage } = useContext(CaptureContext);
  const [stickers, setStickers] = useState([]);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const addSticker = (src) => {
    setStickers([...stickers, { id: Date.now(), src, x: 100, y: 100 }]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stickerSrc = e.dataTransfer.getData('text/plain');
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStickers([...stickers, { id: Date.now(), src: stickerSrc, x, y }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter((sticker) => sticker.id !== id));
  };

  const drawStickers = (context, scale) => {
    return Promise.all(
      stickers.map((sticker) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = sticker.src;
          img.onload = () => {
            context.drawImage(
              img,
              sticker.x * scale,
              sticker.y * scale,
              100 * scale,
              100 * scale
            );
            resolve();
          };
        });
      })
    );
  };

  const prepareImageForSaving = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas dimensions to match the displayed image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Calculate scaling factor between the displayed image and actual size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const scale = Math.min(scaleX, scaleY);

    // Draw the original captured image onto the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw the stickers on top, with scaling applied
    await drawStickers(context, scale);

    // Return the canvas data URL
    return canvas.toDataURL('image/png');
  };

  const handleFinish = async () => {
    const imageUrl = await prepareImageForSaving();
    navigate('/save', { state: { imageUrl } });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // 스티커 카테고리
  const stickerCategory = [
    '/images/sticker1.png',
    '/images/sticker2.png',
    '/images/sparkleHeart.png',
    '/images/yellowHeart.png',
    '/images/fireHeart.png',
    '/images/blackHeart.png',
  ];

  // 스티커 카테고리
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleStickerClick = (index) => {
    setSelectedCategory(index);
  };

  return (
    <div className="decorate-view" onDrop={handleDrop} onDragOver={handleDragOver}>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className="photo-area" style={{ position: 'relative' }}>
        {capturedImage && (
          <img ref={imageRef} src={capturedImage} alt="Captured" />
        )}
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            style={{
              position: 'absolute',
              left: sticker.x,
              top: sticker.y,
              cursor: 'default',
            }}
          >
            <img
              src={sticker.src}
              alt="sticker"
              style={{
                width: '100px',
                height: '100px',
                pointerEvents: 'none', // Prevent drag-and-drop for placed stickers
              }}
            />
            <button
              className="delete-button"
              onClick={() => removeSticker(sticker.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={handleFinish}
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
          }}
        >
          <img
            src={'/images/done.png'}
            alt="Finish"
            style={{ width: '50px', height: 'auto' }}
          />
        </button>
      </div>

      <div className={`modal-container ${isModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="sticker-list">
            {stickerCategory.map((src, index) => (
              <div
                className="sticker-choose"
                key={index}
                draggable // Make stickers draggable from here
                onDragStart={(e) => e.dataTransfer.setData('text/plain', src)}
              >
                <img
                  src={src}
                  className="sticker-cat"
                  alt={`sticker-${index}`}
                  onClick={() => addSticker(src)}
                />
              </div>
            ))}
          </div>
          <StickerPanel onSelect={addSticker} />
        </div>

        <button className="toggle-modal-button" onClick={toggleModal}>
          <img
            src={isModalOpen ? '/images/ChevronDown.png' : '/images/chevronUp.png'}
            alt="Toggle"
            className="updown-img"
          />
        </button>
      </div>
    </div>
  );
}

export default DecoView;
