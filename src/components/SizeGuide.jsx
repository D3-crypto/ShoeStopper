import React, { useState } from 'react';
import './SizeGuide.css';

const SizeGuide = ({ product, onClose }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [footLength, setFootLength] = useState('');
  const [footWidth, setFootWidth] = useState('');
  const [recommendedSize, setRecommendedSize] = useState('');

  // Default size chart if product doesn't have one
  const defaultSizeChart = [
    { size: '6', length: 24.1, width: 8.9 },
    { size: '6.5', length: 24.4, width: 9.0 },
    { size: '7', length: 24.8, width: 9.1 },
    { size: '7.5', length: 25.1, width: 9.2 },
    { size: '8', length: 25.4, width: 9.3 },
    { size: '8.5', length: 25.7, width: 9.4 },
    { size: '9', length: 26.0, width: 9.5 },
    { size: '9.5', length: 26.4, width: 9.6 },
    { size: '10', length: 26.7, width: 9.7 },
    { size: '10.5', length: 27.0, width: 9.8 },
    { size: '11', length: 27.3, width: 9.9 },
    { size: '11.5', length: 27.6, width: 10.0 },
    { size: '12', length: 28.0, width: 10.1 }
  ];

  const sizeChart = product?.sizeGuide?.measurements || defaultSizeChart;

  const calculateSize = () => {
    if (!footLength || !footWidth) {
      alert('Please enter both foot length and width');
      return;
    }

    const length = parseFloat(footLength);
    const width = parseFloat(footWidth);

    // Find the best fitting size
    let bestSize = sizeChart[0];
    let smallestDiff = Math.abs(bestSize.length - length) + Math.abs(bestSize.width - width);

    sizeChart.forEach(size => {
      const diff = Math.abs(size.length - length) + Math.abs(size.width - width);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestSize = size;
      }
    });

    // Add recommendation based on foot shape
    let sizeRecommendation = `Size ${bestSize.size}`;
    
    if (width > bestSize.width + 0.3) {
      sizeRecommendation += ' (consider going up half a size for wide feet)';
    } else if (width < bestSize.width - 0.3) {
      sizeRecommendation += ' (might run slightly wide for you)';
    }

    setRecommendedSize(sizeRecommendation);
  };

  const measurementTips = [
    'Measure your feet at the end of the day when they\'re largest',
    'Stand on a piece of paper and trace around your foot',
    'Measure the longest distance from heel to toe',
    'Measure the widest part of your foot',
    'If one foot is larger, use the larger measurement',
    'Add 0.5-1cm for comfortable fit'
  ];

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
        <div className="size-guide-header">
          <h2>Size Guide</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="size-guide-tabs">
          <button 
            className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            Size Chart
          </button>
          <button 
            className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Size Calculator
          </button>
          <button 
            className={`tab ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            Measuring Tips
          </button>
        </div>

        <div className="size-guide-content">
          {activeTab === 'chart' && (
            <div className="size-chart">
              <h3>Size Chart (in cm)</h3>
              {product?.sizeGuide?.fitAdvice && (
                <div className="fit-advice">
                  <strong>Fit Advice:</strong> {product.sizeGuide.fitAdvice}
                </div>
              )}
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Length (cm)</th>
                    <th>Width (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map(size => (
                    <tr key={size.size}>
                      <td>{size.size}</td>
                      <td>{size.length}</td>
                      <td>{size.width}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="size-calculator">
              <h3>Find Your Perfect Size</h3>
              <p>Enter your foot measurements to get a size recommendation:</p>
              
              <div className="measurement-inputs">
                <div className="input-group">
                  <label htmlFor="foot-length">Foot Length (cm)</label>
                  <input
                    id="foot-length"
                    type="number"
                    step="0.1"
                    value={footLength}
                    onChange={(e) => setFootLength(e.target.value)}
                    placeholder="e.g., 26.5"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="foot-width">Foot Width (cm)</label>
                  <input
                    id="foot-width"
                    type="number"
                    step="0.1"
                    value={footWidth}
                    onChange={(e) => setFootWidth(e.target.value)}
                    placeholder="e.g., 9.5"
                  />
                </div>
              </div>

              <button className="calculate-btn" onClick={calculateSize}>
                Calculate My Size
              </button>

              {recommendedSize && (
                <div className="size-recommendation">
                  <h4>Recommended Size:</h4>
                  <p>{recommendedSize}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="measurement-tips">
              <h3>How to Measure Your Feet</h3>
              <div className="tips-list">
                {measurementTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-number">{index + 1}</span>
                    <span className="tip-text">{tip}</span>
                  </div>
                ))}
              </div>
              
              <div className="measurement-illustration">
                <img 
                  src="/foot-measurement-guide.svg" 
                  alt="Foot measurement guide"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;