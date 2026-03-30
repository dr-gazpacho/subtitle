import { useEffect } from "react";
import { formatTranscript } from "@/utils/clientUtils";
import { SimplifiedTranscript } from "@/data/types";

interface TranscriptViewProps {
  words: SimplifiedTranscript[] | null;
  activeIndex: number;
  onWordClick: (startTime: number) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  words,
  activeIndex,
  onWordClick,
}) => {
  const turns = formatTranscript(words);

  useEffect(() => {
    if (activeIndex !== -1) {
      // I think this will technically "scroll into view" elements that are on the same line (doesn't happen visually, but might happen computationally), which is expending some unnecessary energy
      // post completion TO DO (if time) - explore "line based scrolling" as opposed to "word based", will probably require some sort of map to link activeIndex to new lineIndex or something
      const activeElement = document.getElementById(`word-${activeIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center", // I have a lot of the transcript visible - but this will keep the active word in the center to reduce attention fatigue
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col gap-8 p-6 bg-white rounded-xl shadow-inner max-h-[400px] overflow-y-auto">
      {/* speaker name */}
      {turns.map((turn, tIdx) => (
        <div key={tIdx} className="group flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {turn.speaker}
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          {/* full content of speaker's "speaking turn" */}
          <div className="flex flex-wrap leading-relaxed">
            {turn.words.map((w) => (
              <span
                key={w.globalIndex}
                id={`word-${w.globalIndex}`}
                onClick={() => onWordClick(w.start)}
                className={`
                  cursor-pointer px-0.5 rounded transition-all duration-150 text-lg
                  ${
                    activeIndex === w.globalIndex
                      ? "bg-yellow-300 text-black font-medium scale-105 shadow-sm z-10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-black"
                  }
                `}
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptView;
