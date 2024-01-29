import React, { useState } from 'react';
import { Range } from 'react-range';

const TimelineSlider = ({ maxTimeInSeconds, onSliderChange }) => {
  const formatTime = (seconds) => {
    const pad = (value) => (value < 10 ? `0${value}` : `${value}`);
    const hours = pad(Math.floor(seconds / 3600));
    const minutes = pad(Math.floor((seconds % 3600) / 60));
    const secs = pad(seconds % 60);

    return `${hours}:${minutes}:${secs}`;
  };

  const [values, setValues] = useState([0, maxTimeInSeconds]);

  const handleSliderChange = (newValues) => {
    setValues(newValues);
    console.log('Selected Range: ', newValues.map((value) => formatTime(value)));
    onSliderChange(newValues);
    // Здесь вы можете обработать изменение значений
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '50px', width: '1000px' }}>
      <Range
        step={1}
        min={0}
        max={maxTimeInSeconds}
        values={values}
        onChange={handleSliderChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '6px',
              width: '100%',
              backgroundColor: '#ccc',
              borderRadius: '3px',
              position: 'relative',
            }}
          >
            {children}
            <div
              style={{
                position: 'absolute',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: '#007BFF',
                left: `${(values[0] / maxTimeInSeconds) * 100}%`,
                width: `${((values[1] - values[0]) / maxTimeInSeconds) * 100}%`,
              }}
            />
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            isDragged = {true}
            style={{
              ...props.style,
              height: '16px',
              width: '16px',
              borderRadius: '50%',
              backgroundColor: '#007BFF',
              boxShadow: '0 2px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatTime(values[index])}
            </div>
          </div>
        )}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div>{formatTime(0)}</div>
        <div>{formatTime(maxTimeInSeconds)}</div>
      </div>
    </div>
  );
};

export default TimelineSlider;
