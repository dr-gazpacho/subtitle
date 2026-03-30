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

  return (
    <div className="flex flex-col gap-8 p-6 bg-white rounded-xl shadow-inner max-h-[500px] overflow-y-auto">
      {turns.map((turn, tIdx) => (
        <div key={tIdx} className="group flex flex-col gap-2">
          {/* speaker label */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {turn.speaker}
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          {/* "speaking turn" content */}
          <div className="flex flex-wrap leading-relaxed">
            {turn.words.map((w) => (
              <span
                key={w.globalIndex}
                id={`word-${w.globalIndex}`} // TO DO - autoscroll? searchable?
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
