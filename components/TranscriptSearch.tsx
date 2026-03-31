import React, { useState, useMemo, useEffect } from "react";
import { formatTranscript } from "@/utils/clientUtils";
import { SimplifiedTranscript } from "@/data/types";

interface TranscriptSearchProps {
  words: SimplifiedTranscript[] | null;
  onWordClick: (startTime: number) => void;
}

interface Match {
  speaker: string;
  words: (SimplifiedTranscript & { globalIndex: number })[];
  matchStartIndex: number;
  matchEndIndex: number;
}

const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  words,
  onWordClick,
}) => {
  // this will be sort of like a finite state machine where inputValue sets the state of searchTerm and searchTerm controls the search
  // user types a word/phrase (state is constantly updating but no search happens) -> stop typing -> .3 seconds elapses and search term state captures input state
  // --> search term state updates which triggers the search for word or phrase

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const turns = useMemo(() => formatTranscript(words), [words]);

  // debouncer makes this feel a little smoother
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const results = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    // when you reach for regex have you reached too far?
    // this is a little defensive programming, definitely overkill - splits on each whitespace characters or chunk of one or more whitespace characters
    const searchWords = query.split(/\s+/);
    const matches: Match[] = [];

    // I don't know if this is the best sliding window but it works
    // Maybe there's a world where we also want the timestamps considered or something.. for now we're going to return each speaking turn which contains the searchTerm
    turns.forEach((turn) => {
      for (let i = 0; i <= turn.words.length - searchWords.length; i++) {
        let matchFound = true;
        for (let j = 0; j < searchWords.length; j++) {
          if (!turn.words[i + j].word.toLowerCase().includes(searchWords[j])) {
            matchFound = false;
            break;
          }
        }
        if (matchFound) {
          matches.push({
            speaker: turn.speaker,
            words: turn.words,
            matchStartIndex: i,
            matchEndIndex: i + searchWords.length - 1,
          });
        }
      }
    });
    return matches;
  }, [searchTerm, turns]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <input
          type="text"
          placeholder='Try "first tuesday of the month"...'
          className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-slate-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
        {searchTerm && results.length === 0 ? (
          <p className="p-8 text-center text-slate-400 italic">
            No matches found.
          </p>
        ) : (
          results.map((res, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                {res.speaker}
              </span>
              <div className="flex flex-wrap gap-1">
                {res.words.map(
                  (
                    w: SimplifiedTranscript & { globalIndex: number },
                    wIdx: number,
                  ) => {
                    const isMatchPart =
                      wIdx >= res.matchStartIndex && wIdx <= res.matchEndIndex;
                    return (
                      <span
                        key={wIdx}
                        onClick={() => onWordClick(w.start)}
                        className={`cursor-pointer px-1 rounded text-sm transition-all ${
                          isMatchPart
                            ? "bg-yellow-300 text-black font-bold scale-110 shadow-sm z-10"
                            : "text-slate-600 hover:bg-slate-200 hover:text-black"
                        }`}
                      >
                        {w.word}
                      </span>
                    );
                  },
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptSearch;
