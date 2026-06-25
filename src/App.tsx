import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Hammer, BookOpen, History, Loader2, PlayCircle, 
  RotateCcw, CheckCircle, FileText, ChevronRight, Compass, ShieldAlert, BadgeAlert, Award
} from 'lucide-react';
import { Role, RoleId, Quote, RatingState, Ratings } from './types';
import { ROLES, QUOTES } from './data';
import SpinWheel from './components/SpinWheel';
import VideoPlayer from './components/VideoPlayer';
import ActiveRatingDeck from './components/ActiveRatingDeck';
import QuotesTable from './components/QuotesTable';
import ReportExport from './components/ReportExport';

const siwLogoDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="100" height="100" fill="%23000000" rx="12"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="950" font-size="34" fill="%23FF0000" text-anchor="middle" dominant-baseline="middle" filter="url(%23glow)" letter-spacing="1">SIW</text><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="950" font-size="34" fill="%23FFFF00" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">SIW</text></svg>`;

export default function App() {
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote>(QUOTES[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [ratings, setRatings] = useState<Ratings>({});
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  // Load state from localStorage on init
  useEffect(() => {
    const savedRole = localStorage.getItem('saugus_role') as RoleId | null;
    const savedRatings = localStorage.getItem('saugus_ratings');
    const savedName = localStorage.getItem('saugus_student_name');
    const savedEmail = localStorage.getItem('saugus_student_email');

    if (savedRole && ROLES[savedRole]) {
      setSelectedRoleId(savedRole);
    }
    if (savedRatings) {
      try {
        setRatings(JSON.parse(savedRatings));
      } catch (e) {
        console.error("Failed to parse saved ratings", e);
      }
    }
    if (savedName) setStudentName(savedName);
    if (savedEmail) setStudentEmail(savedEmail);
  }, []);

  const handleRoleSelected = (roleId: RoleId) => {
    setSelectedRoleId(roleId);
    localStorage.setItem('saugus_role', roleId);
    
    // Auto populate initial empty ratings for all quotes
    const initialRatings: Ratings = { ...ratings };
    QUOTES.forEach(q => {
      if (!initialRatings[q.id]) {
        initialRatings[q.id] = { isLiked: null, explanation: '' };
      }
    });
    setRatings(initialRatings);
    localStorage.setItem('saugus_ratings', JSON.stringify(initialRatings));
  };

  // Revert back to just managing text, fixed keystroke flood caused by Agreed comment box
 const handleRatingChange = (quoteId: number, isLiked: boolean | null, explanation: string) => {
    const updated = {
      ...ratings,
      [quoteId]: { isLiked, explanation }
    };
    setRatings(updated);
    localStorage.setItem('saugus_ratings', JSON.stringify(updated));
  };

  const handleStudentInfoChange = (name: string, email: string) => {
    setStudentName(name);
    setStudentEmail(email);
    localStorage.setItem('saugus_student_name', name);
    localStorage.setItem('saugus_student_email', email);
  };

  const handleResetSession = () => {
    setSelectedRoleId(null);
    setRatings({});
    setCurrentTime(0);
    setCurrentQuote(QUOTES[0]);
    localStorage.removeItem('saugus_role');
    localStorage.removeItem('saugus_ratings');
    setIsResetConfirming(false);
  };

  const selectedRole = selectedRoleId ? ROLES[selectedRoleId] : null;

  // Render icon for each role quadrant
  const renderRoleIcon = (roleId: RoleId, sizeClass = "w-5 h-5") => {
    switch (roleId) {
      case 'archaeologist':
        return <Compass className={sizeClass} />;
      case 'historian':
        return <BookOpen className={sizeClass} />;
      case 'worker':
        return <Hammer className={sizeClass} />;
      case 'descendant':
        return <History className={sizeClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans antialiased pb-12 selection:bg-natural-accent selection:text-white">
      
      {/* Editorial Header Banner */}
      <header className="bg-natural-dark border-b-2 border-natural-darker py-4 px-4 shadow-lg text-natural-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={siwLogoDataUrl} 
              alt="SIW logo" 
              className="h-9 w-9 rounded shadow object-contain" 
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-natural-sage text-[#F5F2ED] text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded">
                  1950s Primary Source Film Activity
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white">
                Saugus Iron Works Restoration Explorer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedRole ? (
              <div className="flex items-center gap-2 bg-natural-darker border border-natural-sand-dark/30 py-1.5 px-3 rounded text-xs leading-none">
                {renderRoleIcon(selectedRoleId!, "w-4 h-4 text-amber-500")}
                <div>
                  <span className="text-[9px] text-[#D1C7B7] font-mono block">ASSIGNED PERSONA</span>
                  <strong className="text-white font-serif">{selectedRole.name}</strong>
                </div>
                {isResetConfirming ? (
                  <div className="ml-3 flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded text-[11px]">
                    <span className="text-stone-300 font-mono">Erase data?</span>
                    <button
                      onClick={handleResetSession}
                      className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Yes
                    </button>
                    <span className="text-[#D1C7B7]/40">/</span>
                    <button
                      onClick={() => setIsResetConfirming(false)}
                      className="text-stone-300 hover:text-white hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsResetConfirming(true)}
                    className="ml-3 hover:underline text-rose-400 font-bold block bg-transparent border-none cursor-pointer"
                  >
                    Reset Role
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-stone-300 italic">Assign role playing persona to begin lesson</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        
        {/* If NO role is selected -> Show Phase 1 Choose Role Panel */}
        {!selectedRoleId ? (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Introduction Card */}
            <div className="bg-[#E6E0D4] border border-[#D1C7B7] p-6 md:p-8 rounded-xl shadow-md text-center max-w-2xl mx-auto text-natural-text">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-natural-dark mb-3">
                After 380 years the Saugus Iron Works has been uncovered!
              </h2>
              <p className="text-sm font-serif leading-relaxed mb-4 text-[#3D332D]">
                History in the making, 1950s style. Study the film <i>The Saugus Iron Works Restoration</i> as the primary source. 
                You will take on the persona of one of the main characters who played an important role in this project.
                From advocate, to researcher, to excavator, and builder, you will be placed inside a role.
              </p>
              <div className="text-[11px] bg-natural-dark text-white rounded p-3 inline-block font-mono">
                Objective: Judge which of the four characters is likely to say each documentary narration phrase.
              </div>
            </div>

            {/* Split layout: Selector wheel & Quadrants display grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* Spinner Column */}
              <div className="flex flex-col justify-center">
                <SpinWheel 
                  selectedRoleId={selectedRoleId}
                  onRoleSelected={handleRoleSelected}
                />
              </div>

              {/* Roles Quadrants Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(ROLES).map((role) => (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelected(role.id)}
                    className="bg-[#E6E0D4] border border-[#D1C7B7] p-5 rounded-xl shadow-md hover:border-natural-accent transition cursor-pointer flex flex-col gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-white/85 rounded-lg text-natural-dark group-hover:bg-natural-accent group-hover:text-white transition">
                        {renderRoleIcon(role.id)}
                      </div>
                      <span className="text-[10px] font-bold font-mono text-[#5A5A40] bg-white/60 py-0.5 px-2 rounded-full">
                        Quadrant Q{role.quadrant}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-serif font-bold text-natural-dark group-hover:text-natural-accent leading-snug">
                        {role.name}
                      </h4>
                      <span className="text-[10px] text-[#5A5A40] font-mono italic block mb-1">
                        {role.shortTitle}
                      </span>
                      <p className="text-xs text-stone-700 leading-normal line-clamp-3 font-serif">
                        {role.description}
                      </p>
                    </div>

                    <div className="mt-auto text-[10px] text-natural-accent font-serif flex items-center gap-1 group-hover:text-natural-accent-hover font-semibold">
                      <span>Select role manually</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        ) : (
          /* Active Classroom Panel */
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Step 2 Panel: 'My Role' Large Rectangle Description */}
            <div id="active-role-card" className="bg-[#5A5A40] text-white rounded-xl p-6 shadow-md border border-natural-dark relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#F5F2ED]/10 rotate-45 pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-natural-dark text-white rounded shadow-inner">
                    {renderRoleIcon(selectedRoleId!, "w-6 h-6")}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white leading-none">
                      My Role: {selectedRole?.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4 text-sm font-serif leading-relaxed text-white font-medium block">
                {selectedRole?.description}
              </div>
            </div>

            {/* Step 3 & 4 Layout: Visual Video Player deck */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2 font-serif text-natural-dark">
                <span className="w-5 h-5 bg-natural-sage text-white text-[10.5px] rounded-full flex items-center justify-center font-mono font-bold">1</span>
                <span className="font-bold text-sm uppercase tracking-wide">WATCH FILM</span>
              </div>
              
              <VideoPlayer 
                currentQuote={currentQuote}
                onQuoteChange={setCurrentQuote}
                onTimeUpdate={setCurrentTime}
                userRatingStatus={ratings}
                selectedRoleId={selectedRoleId!}
              />
            </div>

            {/* Active scoring zone based on video playhead selection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Rating Card */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3 font-serif text-natural-dark">
                  <span className="w-5 h-5 bg-natural-sage text-white text-[10.5px] rounded-full flex items-center justify-center font-mono font-bold">2</span>
                  <span className="font-bold text-sm uppercase tracking-wide font-serif">Share My Thinking</span>
                </div>
                
                <ActiveRatingDeck 
                  currentQuote={currentQuote}
                  selectedRole={selectedRole!}
                  rating={ratings[currentQuote.id]}
                  onRatingChange={handleRatingChange}
                  totalCompleted={Object.values(ratings).filter(r => r.isLiked !== null).length}
                />
              </div>

              {/* Task Instructions Companion card */}
              <div>
                <div className="flex items-center gap-2 mb-3 font-serif text-natural-dark">
                  <span className="w-5 h-5 bg-natural-sage text-[#F5F2ED] text-[10.5px] rounded-full flex items-center justify-center font-mono font-bold">?</span>
                  <span className="font-bold text-sm uppercase tracking-wide font-serif">Role Assignment Objectives</span>
                </div>

                <div className="bg-[#E6E0D4] border border-[#D1C7B7] rounded-xl p-5 text-sm text-natural-text font-serif leading-relaxed shadow-sm">
                  <h4 className="font-bold text-natural-dark mb-1.5 flex items-center gap-1.5 uppercase text-xs tracking-wider border-b border-[#D1C7B7] pb-1.5">
                    <Award className="w-4 h-4 text-natural-accent" />
                    How to evaluate quotes:
                  </h4>
                  <ul className="list-disc pl-4 space-y-2 mt-2 text-xs text-stone-800">
                    <li>As you watch the 15-minute film, the video will automatically pause when it encounters key quotes.</li>
                    <li>Read the quote text and reflect on whether your historical character (e.g. {selectedRole?.shortTitle}) would say or deal with this perspective.</li>
                    <li>If you choose <strong className="text-natural-accent">Yes, Likely (Thumbs Up)</strong>, clarify specifically in the text block why this relates to your work or heritage!</li>
                    <li>If <strong className="text-rose-800 font-semibold">No / Unlikely (Thumbs Down)</strong>, no extra argument is mandated.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Step 4 Quotations List Spreadsheet */}
            <div className="mt-2">
              <QuotesTable 
                quotes={QUOTES}
                ratings={ratings}
                onSelectQuote={setCurrentQuote}
                activeQuoteId={currentQuote.id}
                onRatingChange={handleRatingChange}
                selectedRole={selectedRole!}
              />
            </div>

            {/* Step 6 Export section */}
            <div className="mt-2">
              <ReportExport 
                selectedRole={selectedRole!}
                ratings={ratings}
                quotes={QUOTES}
                studentName={studentName}
                studentEmail={studentEmail}
                onStudentInfoChange={handleStudentInfoChange}
              />
            </div>

          </div>
        )}

      </main>

      {/* Humble educational credit footer */}
      <footer className="text-center text-[10px] text-[#5A5A40] font-mono tracking-wider mt-12 mb-6 flex flex-col items-center gap-1.5">
        <div>Saugus Iron Works Restoration Explorer App • © Project SIW 26 • v1.0</div>
        <div>Credits: Lesson Author - Margaret Briatico, 5th Grade Teacher • App Developer - <a href="mailto:rsimpson3@siw26.org" className="underline hover:text-stone-900 transition-colors">Robert Simpson</a>, Instructional Designer</div>
        <div>Disclaimer: This app is an educational prototype. Please check that it works on your classroom devices, as performance may vary based on your local network and device settings.</div> 
      </footer>

    </div>
  );
}
