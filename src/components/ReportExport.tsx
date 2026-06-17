import React, { useState } from 'react';
import { Download, FileText, Cloud, CheckCircle, AlertCircle, LogIn, LogOut, ArrowUpRight, Printer } from 'lucide-react';
import { Role, Quote, Ratings } from '../types';
import { uploadReportToDrive, googleSignIn, logout, getAccessToken } from '../lib/drive';

interface ReportExportProps {
  selectedRole: Role;
  ratings: Ratings;
  quotes: Quote[];
  studentName: string;
  studentEmail: string;
  onStudentInfoChange: (name: string, email: string) => void;
}

export default function ReportExport({
  selectedRole,
  ratings,
  quotes,
  studentName,
  studentEmail,
  onStudentInfoChange
}: ReportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [driveStatus, setDriveStatus] = useState<{ success?: boolean; url?: string; error?: string } | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(!!getAccessToken());

  // Count progress
  const ratedQuotesCount = Object.keys(ratings).filter(id => ratings[Number(id)].isLiked !== null).length;
  const likedQuotes = quotes.filter(q => ratings[q.id]?.isLiked === true);
  const dislikedQuotes = quotes.filter(q => ratings[q.id]?.isLiked === false);

  const generateReportMarkdown = () => {
    const header = [
      `# SAUGUS IRON WORKS RESTORATION STUDENT REPORT`,
      `============================================================`,
      `**Date of Submission**: ${new Date().toLocaleDateString()}`,
      `**Student Name**: ${studentName || 'Not Provided'}`,
      `**Email**: ${studentEmail || 'Not Provided'}`,
      `**Assigned Role**: ${selectedRole.name}`,
      `**Quadrant**: Q${selectedRole.quadrant} - ${selectedRole.shortTitle}`,
      `============================================================\n`,
      `## PERSONAL ROLE DESCRIPTION`,
      `*${selectedRole.description}*\n`,
      `------------------------------------------------------------\n`,
      `## SUMMARY METRICS`,
      `- **Total Documentary Quotes Scored**: ${ratedQuotesCount} / ${quotes.length}`,
      `- **Quotes Agreed With (Thumbs Up)**: ${likedQuotes.length}`,
      `- **Quotes Disagreed With (Thumbs Down)**: ${dislikedQuotes.length}`,
      `\n------------------------------------------------------------\n`,
      `## EVIDENCE AGREEMENTS & PERSONA JUSTIFICATIONS`
    ].join('\n');

    const agreementsList = likedQuotes.map((q, idx) => {
      const state = ratings[q.id];
      return [
        `### Quote ${q.id}. "${q.text.replace(/“|”/g, '')}"`,
        `- **Documentary Time**: ${Math.floor(q.startTime / 60)}:${(q.startTime % 60).toString().padStart(2, '0')}`,
        `- **Persona Argument / Justification**:`,
        `  > ${state?.explanation || "No explanation provided."}`,
        `\n`
      ].join('\n');
    }).join('\n');

    const disagreementsHeader = `## EVIDENCE DISAGREEMENTS & PHRASES UNLIKELY TO SAY`;
    const disagreementsContent = dislikedQuotes.length > 0 
      ? dislikedQuotes.map(q => `* **Quote ${q.id}**: "${q.text.replace(/“|”/g, '')}"\n  *(Reason: Does not correspond to the responsibilities or cultural scope of the ${selectedRole.name}.)*`).join('\n\n')
      : "*No quote disagreements filed. Student agreed with all analyzed quotes.*";

    return `${header}\n\n${agreementsList}\n\n${disagreementsHeader}\n\n${disagreementsContent}\n\n*File created via Saugus Iron Works Restoration Explorer dashboard.*`;
  };

  const generateReportHTML = () => {
    const agreementsListHTML = likedQuotes.map((q, idx) => {
      const state = ratings[q.id];
      return `
        <div style="border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; background: #fffdfa; border-radius: 6px;">
          <h3 style="color: #2c4a3e; font-size: 14px; margin-top: 0; margin-bottom: 8px; font-family: Georgia, serif;">Quote ${q.id}. "${q.text.replace(/“|”/g, '')}"</h3>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; font-family: monospace;">Documentary Time: ${Math.floor(q.startTime / 60)}:${(q.startTime % 60).toString().padStart(2, '0')}</p>
          <p style="font-size: 12px; font-weight: bold; color: #334155; margin: 0 0 4px 0; font-family: Arial, sans-serif;">My Persona Justification:</p>
          <blockquote style="background: #f8fafc; border-left: 4px solid #a3b899; margin: 0; padding: 10px 15px; font-style: italic; font-size: 12px; color: #334155;">
            ${state?.explanation || "No explanation provided."}
          </blockquote>
        </div>
      `;
    }).join('');

    const disagreementsListHTML = dislikedQuotes.length > 0 
      ? dislikedQuotes.map(q => `
          <div style="border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 10px; background: #fafafa; border-radius: 4px;">
            <p style="font-size: 12px; margin: 0; color: #334155; font-family: Georgia, serif;"><strong>Quote ${q.id}:</strong> "${q.text.replace(/“|”/g, '')}"</p>
            <p style="font-size: 11px; margin: 5px 0 0 0; color: #c084fc; font-style: italic; font-family: Arial, sans-serif;">Reason: Does not correspond to the responsibilities or cultural scope of the ${selectedRole.name}.</p>
          </div>
        `).join('')
      : `<p style="font-size: 12px; color: #64748b; font-style: italic; font-family: Arial, sans-serif;">No quote disagreements filed. Student agreed with all analyzed quotes.</p>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Saugus Iron Works Restoration Student Report</title>
        <style>
          @media print {
            body { padding: 0; margin: 0; }
            .no-print { display: none; }
          }
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; background-color: #ffffff; }
          h1 { color: #1e3a1e; font-size: 24px; border-bottom: 2px solid #2e4a3e; padding-bottom: 10px; margin-top: 0; font-family: Georgia, serif; }
          h2 { color: #2e4a3e; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; font-family: Georgia, serif; }
          .meta-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; }
          .meta-item { font-size: 12px; }
          .meta-label { font-weight: bold; color: #475569; }
          ul { padding-left: 20px; font-size: 12.5px; color: #334155; }
          li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>SAUGUS IRON WORKS RESTORATION STUDENT REPORT</h1>
        
        <div class="meta-box">
          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Date Submitted:</span> ${new Date().toLocaleDateString()}</div>
            <div class="meta-item"><span class="meta-label">Student or Team Name:</span> ${studentName || 'Not Provided'}</div>
            <div class="meta-item"><span class="meta-label">Assigned Role:</span> ${selectedRole.name}</div>
            <div class="meta-item"><span class="meta-label">School Email:</span> ${studentEmail || 'Not Provided'}</div>
            <div class="meta-item" style="grid-column: span 2;"><span class="meta-label">Portfolio Focus:</span> Q${selectedRole.quadrant} - ${selectedRole.shortTitle}</div>
          </div>
        </div>

        <h2>PERSONAL ROLE DESCRIPTION</h2>
        <p style="font-size: 13px; font-style: italic; color: #475569; margin-bottom: 20px; font-family: Georgia, serif; background: #fdfbf7; padding: 12px; border-left: 3px solid #cbd5e1;">
          "${selectedRole.description}"
        </p>

        <h2>SUMMARY METRICS</h2>
        <ul>
          <li><strong>Total Documentary Quotes Scored:</strong> ${ratedQuotesCount} / ${quotes.length}</li>
          <li><strong>Quotes Agreed With (Thumbs Up):</strong> ${likedQuotes.length}</li>
          <li><strong>Quotes Disagreed With (Thumbs Down):</strong> ${dislikedQuotes.length}</li>
        </ul>

        <h2>EVIDENCE AGREEMENTS & PERSONA JUSTIFICATIONS</h2>
        ${agreementsListHTML || '<p style="font-size: 12.5px; color: #64748b; font-style: italic;">No quote agreements completed yet.</p>'}

        <h2>EVIDENCE DISAGREEMENTS & UNLIKELY PHRASES</h2>
        ${disagreementsListHTML}

        <p style="margin-top: 50px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-family: monospace;">
          Report generated from Saugus Iron Works Restoration Explorer · © Project SIW 26
        </p>
      </body>
      </html>
    `;
  };

  const downloadWordDoc = () => {
    const htmlContent = generateReportHTML();
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Saugus_Restoration_Report_${(studentName || 'Student').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const htmlContent = generateReportHTML();
    
    // Check if we are in a sandboxed iframe environment
    const isIFrame = window.self !== window.top;
    
    if (isIFrame) {
      // For iframe environments, download an HTML document that auto-triggers system print dialog on open
      const autoPrintHTML = htmlContent.replace(
        '</body>',
        `<script>
          // Automatically trigger print dialog when opened in browser tab
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script></body>`
      );
      
      const blob = new Blob([autoPrintHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Saugus_Report_Printable_${(studentName || 'Student').replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert("Note: Because this application is running inside a secure preview frame, browsers block direct printing. We have downloaded a specialized 'Printable' file instead. \n\nSimply double-click the downloaded file on your computer to open it – it will automatically open your computer's Print and 'Save as PDF' dialog!");
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
        
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error("Iframe printing blocked or failed, throwing fallback...", e);
            // Fallback download if iframe print throws
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Saugus_Restoration_Report_${(studentName || 'Student').replace(/\s+/g, '_')}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1500);
          }
        }, 500);
      } else {
        throw new Error("Cannot access iframe document object");
      }
    } catch (err) {
      console.warn("Direct iframe print failed, executing fallback download:", err);
      // Fallback: download styled HTML file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Saugus_Restoration_Report_${(studentName || 'Student').replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setIsSignedIn(true);
        if (result.user?.name) {
          onStudentInfoChange(result.user.name, result.user.email || studentEmail);
        }
      }
    } catch (e) {
      alert("Sign-in failed. You can paste a standard access token below manually.");
      setShowTokenInput(true);
    }
  };

  const handleManualTokenSubmit = () => {
    if (customToken.trim()) {
      localStorage.setItem('google_access_token', customToken.trim());
      // For fallback
      window.location.reload();
    }
  };

  const handleExportToGoogleDrive = async () => {
    setIsExporting(true);
    setDriveStatus(null);
    const filename = `Saugus_Restoration_Report_${(studentName || 'Student').replace(/\s+/g, '_')}`;
    const content = generateReportHTML();

    const response = await uploadReportToDrive(filename, content, 'text/html', true);
    if (response.success) {
      setDriveStatus({ success: true, url: response.url });
    } else {
      setDriveStatus({ error: response.error });
    }
    setIsExporting(false);
  };

  const handleLogout = () => {
    logout();
    setIsSignedIn(false);
    window.location.reload();
  };

  return (
    <div className="bg-[#FEFDFB] border border-natural-sand-dark rounded-xl p-6 shadow-md flex flex-col gap-6">
      
      {/* Student Details Info */}
      <div>
        <div className="flex items-center gap-2 border-b border-natural-sand pb-3 mb-4">
          <span className="w-5 h-5 bg-natural-sage text-white text-[10.5px] rounded-full flex items-center justify-center font-mono font-bold shrink-0">
            4
          </span>
          <h3 className="text-lg font-serif font-bold text-natural-dark">
            Share My Work
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif font-bold text-natural-dark">Student or Team Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => onStudentInfoChange(e.target.value, studentEmail)}
              placeholder="Enter your first name or team"
              className="py-2.5 px-3 border border-natural-sand-dark rounded text-xs bg-white focus:outline-none focus:border-natural-accent text-natural-text font-serif"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif font-bold text-natural-dark">School Email Address</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => onStudentInfoChange(studentName, e.target.value)}
              placeholder="e.g. elizabeth@hammersmith.edu"
              className="py-2.5 px-3 border border-natural-sand-dark rounded text-xs bg-white focus:outline-none focus:border-natural-accent text-natural-text font-serif"
            />
          </div>
        </div>

        {/* Real-time stats */}
        <div className="bg-[#F5F2ED] border border-natural-sand-dark p-3.5 rounded text-xs flex flex-wrap justify-between items-center gap-1.5 text-stone-700 font-serif">
          <span>Active Role: <strong className="text-natural-accent">{selectedRole.name}</strong></span>
          <span>Timeline quotes cataloged: <strong className="font-mono text-natural-dark">{ratedQuotesCount} / {quotes.length}</strong></span>
          <span>Approved portfolio: <strong className="text-emerald-800">{likedQuotes.length}</strong></span>
        </div>
      </div>

      {/* Export Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Local Download Block */}
        <div className="border border-natural-sand-dark rounded p-4 flex flex-col gap-3 justify-between bg-[#F5F2ED]/60">
          <div>
            <h4 className="text-xs uppercase font-serif font-bold text-natural-dark tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-natural-accent" />
              Download Report Offline
            </h4>
            <p className="text-stone-600 text-[11px] leading-relaxed font-serif">
              Save your completed timeline role-play arguments locally. Choose a Microsoft Word Document (.doc) to open in MS Word or Google Docs, or print/save directly as a PDF!
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={downloadWordDoc}
              className="w-full text-xs font-serif font-bold bg-natural-dark text-white hover:bg-natural-dark-hover py-2.5 px-4 rounded flex items-center justify-center gap-2 tracking-wide transition shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Word Document (.doc)
            </button>
            <button
              onClick={printReport}
              className="w-full text-xs font-serif font-bold bg-natural-dark text-white hover:bg-natural-dark-hover py-2.5 px-4 rounded flex items-center justify-center gap-2 tracking-wide transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Cloud Upload Block (Google Drive) */}
        <div className="border border-natural-sand-dark rounded p-4 flex flex-col gap-3 justify-between bg-[#A3B899]/10">
          <div>
            <h4 className="text-xs uppercase font-serif font-bold text-natural-dark tracking-wider mb-1 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-natural-accent" />
              Export to Google Drive
            </h4>
            <p className="text-stone-600 text-[11px] leading-relaxed font-serif">
              Save your restored timeline homework directly in your Google Drive cloud space. It automatically creates a beautifully-styled, editable Google Doc!
            </p>
          </div>

          {isSignedIn ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportToGoogleDrive}
                disabled={isExporting}
                className={`w-full text-xs font-serif font-bold py-2.5 px-4 rounded flex items-center justify-center gap-2 tracking-wide transition shadow cursor-pointer ${
                  isExporting
                    ? 'bg-neutral-300 text-stone-500 cursor-not-allowed'
                    : 'bg-natural-accent hover:bg-natural-accent-hover text-white'
                }`}
              >
                <Cloud className="w-4 h-4 rotate-180" />
                {isExporting ? 'Creating Google Doc...' : 'Export as Google Doc'}
              </button>

              <div className="flex justify-between items-center text-[10px] text-[#5A5A40]">
                <span className="font-mono">Account Authorized</span>
                <button onClick={handleLogout} className="hover:underline flex items-center gap-1 text-natural-accent font-bold cursor-pointer">
                  <LogOut className="w-2.5 h-2.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="gsi-material-button w-full border border-natural-sand-dark bg-white hover:bg-[#F5F2ED] py-2 px-3 rounded flex items-center justify-center gap-2 text-natural-dark font-serif text-xs font-bold cursor-pointer shadow-sm transition active:scale-95"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Connect Google Drive</span>
            </button>
          )}

        </div>

      </div>

      {/* Cloud Export Status Frame */}
      {driveStatus && (
        <div className={`p-4 rounded text-xs border flex items-start gap-2.5 shadow-inner font-serif ${
          driveStatus.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-[#F2EDE4] border-natural-sand-dark text-stone-800'
        }`}>
          {driveStatus.success ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-1">Google Doc Created!</p>
                <p className="text-stone-600 mb-2">
                  Your formatted Saugus report has been added to your Google Drive directory as a fully editable Google Doc document.
                </p>
                {driveStatus.url && (
                  <a
                    href={driveStatus.url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-natural-accent hover:underline"
                  >
                    Open in Google Drive
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-natural-accent shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-1.5">
                <p className="font-bold text-natural-dark">Google Integration Token Option</p>
                <p className="text-stone-600">
                  Authentication redirect is restricted inside sandbox iframes. You can manually input an Access Token for direct upload or use our seamless local downloader above!
                </p>

                <div className="flex gap-2 mt-1">
                  <input
                    type="password"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Enter manual Google Access Token"
                    className="flex-1 p-2 border border-natural-sand-dark bg-white rounded font-mono text-[11px] focus:outline-none focus:border-natural-accent"
                  />
                  <button
                    onClick={handleManualTokenSubmit}
                    className="bg-natural-dark hover:bg-natural-dark-hover text-white font-serif font-bold text-xs px-3.5 py-1 rounded cursor-pointer shadow"
                  >
                    Submit Scope
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
