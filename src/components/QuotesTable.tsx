import React from 'react';
import { ThumbsUp, ThumbsDown, Clock, Search, HelpCircle, AlertCircle } from 'lucide-react';
import { Quote, RatingState, Role } from '../types';

interface QuotesTableProps {
  quotes: Quote[];
  ratings: Record<number, RatingState>;
  onSelectQuote: (quote: Quote) => void;
  activeQuoteId: number;
  onRatingChange: (quoteId: number, isLiked: boolean | null, explanation: string) => void;
  selectedRole: Role | null;
}

export default function QuotesTable({
  quotes,
  ratings,
  onSelectQuote,
  activeQuoteId,
  onRatingChange,
  selectedRole
}: QuotesTableProps) {
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#FEFDFB] border border-natural-sand-dark rounded-xl shadow-md overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-natural-sand flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5F2ED]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 bg-natural-sage text-white text-[10.5px] rounded-full flex items-center justify-center font-mono font-bold shrink-0">
              3
            </span>
            <h3 className="text-lg font-serif font-bold text-natural-dark">
              Review My Work
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1 font-serif leading-relaxed">
            Review and edit your ratings. Be sure to justify each <span className="bg-[#A3B899] text-black font-mono font-bold px-1.5 py-0.5 rounded mx-0.5">Agreed</span> quote with your own comment.
          </p>
        </div>
        <div className="text-xs font-serif font-bold bg-white text-[#5A5A40] px-3 py-1.5 rounded border border-natural-sand-dark shrink-0">
          Scoring progress: <strong className="font-extrabold text-natural-accent">{Object.keys(ratings).filter(k => ratings[Number(k)]?.isLiked !== null).length} / 19</strong> Quotes
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-natural-sand bg-[#E6E0D4] text-[#5A5A40] font-mono font-bold text-[10px] tracking-wider uppercase">
              <th className="py-3 px-4 w-12 text-center text-natural-dark">ID</th>
              <th className="py-3 px-4 w-20 text-natural-dark">Timeline</th>
              <th className="py-3 px-4 min-w-[325px] text-natural-dark">Quotation text / narration snippet</th>
              <th className="py-3 px-4 w-44 text-natural-dark text-center">Persona Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-natural-sand text-xs font-serif text-[#2C2420]">
            {quotes.map((q) => {
              const rating = ratings[q.id];
              const isLiked = rating?.isLiked ?? null;
              const explanation = rating?.explanation ?? '';
              const isActive = q.id === activeQuoteId;

              // Check if role aligns
              const isCompatible = selectedRole ? q.associatedRoles.includes(selectedRole.id) : false;

              return (
                <React.Fragment key={q.id}>
                  <tr
                    className={`hover:bg-[#F5F2ED]/60 cursor-pointer transition ${
                      isActive ? 'bg-[#E6E0D4]/40 font-medium' : ''
                    }`}
                    onClick={() => onSelectQuote(q)}
                  >
                    {/* ID */}
                    <td className="py-4 px-4 text-center font-bold">
                      <span className={`inline-flex w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono ${
                        isActive ? 'bg-natural-dark text-white font-bold shadow' : 'bg-white text-[#5A5A40] border border-natural-sand-dark'
                      }`}>
                        {q.id}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-4 whitespace-nowrap text-[#5A5A40] font-mono font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-natural-accent" />
                        {formatTime(q.startTime)}
                      </span>
                    </td>

                    {/* Quote Text */}
                    <td className="py-4 px-4 pr-6">
                      <div className="flex flex-col gap-1">
                        <p className={`font-serif leading-relaxed italic ${isActive ? 'text-[#1A1613] font-bold' : 'text-[#3D332D]'}`}>
                          {q.text}
                        </p>
                        
                        {selectedRole && isActive && (
                          <span className="text-[10px] text-[#5A5A40] leading-none font-mono font-bold">
                            Originally cited for: <span className="underline decoration-natural-accent">{q.associatedRoles.map(role => role.toUpperCase()).join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Interactive Buttons Column */}
                    <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {/* Thumbs Down */}
                        <button
                          onClick={() => onRatingChange(q.id, false, '')}
                          title="No, my role would not say this"
                          className={`p-1.5 rounded transition cursor-pointer bg-white ${
                            isLiked === false
                              ? 'bg-rose-105 border border-rose-300 text-rose-800 font-bold'
                              : 'bg-white hover:bg-[#F5F2ED] border border-natural-sand-dark text-[#5A5A40]'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs Up */}
                        <button
                          onClick={() => onRatingChange(q.id, true, explanation)}
                          title="Yes, my role would say this"
                          className={`p-1.5 rounded transition cursor-pointer bg-white ${
                            isLiked === true
                              ? 'bg-[#A3B899] border border-[#5A5A40] text-black font-bold'
                              : 'bg-white hover:bg-[#F5F2ED] border border-natural-sand-dark text-[#5A5A40]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {isLiked !== null && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isLiked ? 'bg-[#A3B899] text-black' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isLiked ? 'Agreed' : 'Unlikely'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Spanning justification sub-row under the quote mapping Quotation text & Persona Rating columns */}
                  {isLiked === true && (
                    <tr 
                      className={`transition ${isActive ? 'bg-[#E6E0D4]/20' : ''}`}
                      onClick={() => onSelectQuote(q)}
                    >
                      <td></td>
                      <td></td>
                      <td colSpan={2} className="py-3 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1.5 bg-[#FBF9F6] border border-natural-sand-dark/50 rounded-lg p-3 shadow-sm">
                          <label className="text-xs font-serif font-bold text-natural-dark flex items-center gap-1">
                            <span>My Thoughts:</span>
                          </label>
                          <textarea
                            value={explanation}
                            onChange={(e) => onRatingChange(q.id, true, e.target.value)}
                            placeholder="Type your role comment here..."
                            rows={2}
                            className="w-full bg-white border border-natural-sand-dark rounded-md px-2.5 py-1.5 text-xs text-natural-text placeholder-stone-400 focus:bg-[#FEFDFB] focus:border-natural-accent focus:outline-none font-serif"
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
