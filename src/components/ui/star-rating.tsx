import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
}

export function StarRating({ rating, count }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-[#64748B]" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-[#64748B] ml-2">({count})</span>
      )}
    </div>
  );
}
