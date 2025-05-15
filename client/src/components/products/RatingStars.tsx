interface RatingStarsProps {
  rating: number | null | undefined;
  reviews?: number | null;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({ rating = 5, reviews, size = "sm" }: RatingStarsProps) {
  const ratingValue = rating || 5;
  const roundedRating = Math.round(ratingValue * 2) / 2; // Round to nearest 0.5
  const fullStars = Math.floor(roundedRating);
  const halfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  // Size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const starClass = sizeClasses[size];
  
  return (
    <div className="flex items-center mb-2">
      <div className="flex text-secondary">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg 
            key={`full-${i}`} 
            xmlns="http://www.w3.org/2000/svg" 
            className={starClass} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {/* Half star */}
        {halfStar && (
          <svg 
            key="half" 
            xmlns="http://www.w3.org/2000/svg" 
            className={starClass} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <defs>
              <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path 
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" 
              fill="url(#halfGradient)"
            />
          </svg>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg 
            key={`empty-${i}`} 
            xmlns="http://www.w3.org/2000/svg" 
            className={starClass} 
            viewBox="0 0 20 20" 
            fill="#D1D5DB"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {reviews !== undefined && (
        <span className="text-xs text-neutral-gray ml-1">({reviews})</span>
      )}
    </div>
  );
}
