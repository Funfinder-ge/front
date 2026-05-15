import React, { useRef, useState, useCallback } from "react";
import "./Categories.css";

const ActivityCard = ({
  image,
  name,
  times = [],
  types = [],
  price,
  rating,
  featured = false,
  onClick,
  onReserve,
  onInfo,
}) => {
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;
    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
    card.style.setProperty('--glare-x', `${x * 100}%`);
    card.style.setProperty('--glare-y', `${y * 100}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }, []);

  return (
    <div
      ref={cardRef}
      className={`movie-card movie-card-tilt ${featured ? 'movie-card-featured' : ''}`}
      style={{ width: "380px", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="movie-card-glare" />
      {featured && <div className="movie-card-featured-badge">★ Featured</div>}
      <div className="movinfo">
        <div className="movie-image">
          {!imageLoaded && <div className="movie-image-shimmer" />}
          <img
            src={image}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 350ms ease' }}
          />
          {(price !== undefined && price !== null) && (
            <div className="movie-card-price">
              <span className="movie-card-price-value">{price}</span>
              <span className="movie-card-price-unit">GEL</span>
            </div>
          )}
          {rating !== undefined && rating !== null && (
            <div className="movie-card-rating">★ {Number(rating).toFixed(1)}</div>
          )}
          <div className="hovcontext">
            <div
              className="trailer"
              onClick={(e) => {
                e.stopPropagation();
                onReserve && onReserve();
              }}
            >
              {" "}
              Book Now{" "}
            </div>
            <div
              className="full"
              onClick={(e) => {
                e.stopPropagation();
                onInfo && onInfo();
              }}
            >
              მეტი ინფორმაცია
            </div>
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
};

export default ActivityCard;
