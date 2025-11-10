import React from 'react';
import './Categories.css';

const ActivityCard = ({
  image,
  name,
  times = [],
  types = [],
  onClick,
  onReserve,
  onInfo,
}) => (
  <div
    className="movie-card"
    style={{ width: '380px', cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <div className="movinfo">
      <div className="movie-image">
        <img src={image} alt={name} />
        <div className="hovcontext">
          <div className="trailer" onClick={e => { e.stopPropagation(); onReserve && onReserve(); }}>დაჯავშნა</div>
          <div className="full" onClick={e => { e.stopPropagation(); onInfo && onInfo(); }}>მეტი ინფორმაცია</div>
        </div>
      </div>
      {times.length > 0 && (
        <div className="movtimes">
          {times.map((time, i) => (
            <div className="movtime" key={i}>
              <div>{time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="title" title={name}>
      {name}
    </div>
    {types.length > 0 && (
      <div>
        <div className="movtypes">
          {types.map((type, i) => (
            <div className="movtype" key={i}>
              {type}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default ActivityCard; 