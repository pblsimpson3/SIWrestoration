import React from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, Quote as QuoteIcon, CheckCircle } from 'lucide-react';
import { Quote, Role, RatingState } from '../types';

interface ActiveRatingDeckProps {
  currentQuote: Quote;
  selectedRole: Role;
  rating: RatingState | undefined;
  onRatingChange: (quoteId: number, isLiked: boolean | null, explanation: string) => void;
}

export default function ActiveRatingDeck({
  currentQuote,
  selectedRole,
  rating,
  onRatingChange
}: ActiveRatingDeckProps) {
  const isLiked = rating?.isLiked ?? null;
  const explanation = rating?.explanation ?? '';

  // Helper to safely send rating events to GTM in TypeScript updated -RS3
  const pushRatingToGTM = (quoteId: number, ratingValue: 'likely' | 'unlikely') => {
  // Ensure dataLayer is initialized on the window object
  window.dataLayer = window.dataLayer || [];
  
  const payload = {
    event: 'quote_rated',
    quote_id: `quote_${String(quoteId).padStart(2, '0')}`,
    rating_type: ratingValue
  };

  console.log("Pushing to GTM:", payload); // CRITICAL: Open your browser console (F12) to see if this logs!
  window.dataLayer.push(payload);
  };

  const handleLike = () => {
    onRatingChange(currentQuote.id, true, explanation);
    pushRatingToGTM(currentQuote.id, 'likely');
  };

  const handleDislike = () => {
    // If dislike, we can reset or empty the explanation since step 5 is only required for Thumbs Up.
    onRatingChange(currentQuote.id, false, '');
    pushRatingToGTM(currentQuote.id, 'unlikely');
  };

  const handleExplanationChange = (text: string) => {
    onRatingChange(currentQuote.id, isLiked, text);
  };

  const isRoleMatching = currentQuote.associatedRoles.includes(selectedRole.id);

  return (
    <div className="bg-[#FEFDFB] border border-natural-sand-dark rounded-xl p-6 shadow-md flex flex-col gap-5">
      
      {/* Visual Quote Banner */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#E6E0D4] rounded-xl text-natural-dark shrink-0">
          <QuoteIcon className="w-5 h-5 text-natural-accent" />
        </div>
        <div>
          <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-[#5A5A40] block mb-1">
            Analyzing Quote {currentQuote.id}
          </span>
          <p className="font-serif italic font-bold text-natural-dark text-sm md:text-base leading-relaxed">
            {currentQuote.text}
          </p>
        </div>
      </div>

      {/* Persona Context Info */}
      <div className="bg-[#F5F2ED] border border-natural-sand-dark p-4 rounded-lg text-xs flex flex-col gap-2">
        <p className="text-[#3D332D] font-serif">
          Evaluating as: <strong className="text-natural-accent">{selectedRole.name}</strong> ({selectedRole.shortTitle})
        </p>
        <p className="text-[#5A5A40] font-serif leading-relaxed italic border-t border-natural-sand pt-2">
          {selectedRole.description}
        </p>
      </div>

      {/* Decision Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-b border-natural-sand py-5">
        
        <span className="text-xs font-serif font-bold text-natural-dark max-w-xxs text-center sm:text-left">
          Would you, as a {selectedRole.shortTitle}, say or agree with this phrase?
        </span>

        <div className="flex gap-3 w-full sm:w-auto flex-1 justify-center sm:justify-end">
          
          {/* Dislike / Thumbs Down */}
          <button
            onClick={handleDislike}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg border text-xs font-serif font-bold tracking-wide transition shadow-sm active:scale-95 cursor-pointer ${
              isLiked === false
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-white border-natural-sand-dark text-natural-dark hover:bg-[#F5F2ED]'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            No / Unlikely
          </button>

          {/* Like / Thumbs Up */}
          <button
            onClick={handleLike}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg border text-xs font-serif font-bold tracking-wide transition shadow-sm active:scale-95 cursor-pointer ${
              isLiked === true
                ? 'bg-[#A3B899] border-[#5A5A40] text-[#1A1613]'
                : 'bg-white border-natural-sand-dark text-natural-dark hover:bg-[#F5F2ED]'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Yes, Likely!
          </button>

        </div>

      </div>

      {/* Explanation Textarea (Show only if Thumbs Up is selected) */}
      {isLiked === true && (
        <div className="flex flex-col gap-2 animate-fade-in text-natural-text">
          <div className="flex items-center justify-between">
            <label className="text-xs font-serif font-bold text-natural-dark flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#5A5A40]" />
              Provide Your Persona Justification <span className="text-rose-600 font-sans">*</span>
            </label>
          </div>

          <textarea
            value={explanation}
            onChange={(e) => handleExplanationChange(e.target.value)}
            rows={3}
            required
            placeholder={`Explain why you, as a ${selectedRole.name}, would say this phrase or how it aligns with your historical restoration activities...`}
            className="w-full text-xs p-3 border border-natural-sand-dark rounded focus:outline-natural-accent bg-white text-natural-text font-serif"
          />

          <span className="text-[10px] text-stone-550 italic font-serif">
            Tip: Reflect on how this quote connects to technology, history, lineage, or industrial preservation.
          </span>
        </div>
      )}

      {/* Success Banner if evaluated */}
      {isLiked !== null && (
        <div className={`p-3 rounded text-xs font-serif flex items-center gap-2 ${
          isLiked === true ? 'bg-emerald-100/40 text-emerald-900 border border-emerald-200' : 'bg-rose-100/30 text-rose-900 border border-rose-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {isLiked === true 
              ? 'Thumbs up recorded. Written justification will be added to your homework report.' 
              : 'Thumbs down recorded. This phrase is excluded from your agreement portfolio.'
            }
          </span>
        </div>
      )}

      {/* Red/Green alignment feedback indicator */}
      {isLiked !== null && (
        <div className="p-3 bg-[#F5F2ED] border border-natural-sand-dark rounded text-[11px] text-stone-700 leading-normal flex items-start gap-1.5 font-serif">
          <span className="font-bold text-natural-dark shrink-0">Class Evaluation Match:</span>
          <span>
            {isRoleMatching 
              ? `Correct alignment! Historical transcripts confirm the Saugus ${selectedRole.shortTitle} persona would indeed relate to this perspective.`
              : `Interesting choice! Technically, this quote was originally focused on aspects of the Saugus Restoration not directly in the ${selectedRole.shortTitle}'s main responsibilities, but your defense of it in your explanation will show your creative history reasoning!`
            }
          </span>
        </div>
      )}

    </div>
  );
}
