import React from 'react';
import { X, BookOpen, Link as LinkIcon, Search, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TheoryModalProps {
  onClose: () => void;
  onOpenFullLearn?: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ onClose, onOpenFullLearn }) => {
  const topics = [
    {
      title: '1. What is a Hash Table?',
      desc: 'A data structure that maps keys to array indices using a hash function, achieving average O(1) time complexity for insert, search, and delete.',
      formula: 'Index = h(key) = key % tableSize',
      icon: <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />,
    },
    {
      title: '2. Separate Chaining (Closed Addressing)',
      desc: 'Each slot in the hash table points to a linked list. When keys collide at the same index, they are simply appended to that list.',
      formula: 'Bucket[h(k)].append(k)',
      icon: <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      title: '3. Linear Probing (Open Addressing)',
      desc: 'When a collision happens at index h(k), we search sequentially for the next available slot at (h + 1), (h + 2)... wrapping around if needed.',
      formula: 'h(k, i) = (h(k) + i) % m',
      icon: <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: '4. Quadratic Probing (Open Addressing)',
      desc: 'Instead of linear stepping which causes primary clustering, quadratic probing jumps by squares (+1, +4, +9, +16...) to disperse entries across the table.',
      formula: 'h(k, i) = (h(k) + i²) % m',
      icon: <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: '5. Double Hashing (Open Addressing)',
      desc: 'Uses two independent hash functions: h1 determines the starting index, and h2 calculates a non-zero jump interval unique to each key.',
      formula: 'h(k, i) = (h1(k) + i × h2(k)) % m, where h2(k) ≠ 0',
      icon: <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white dark:bg-[#111827] w-full max-w-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-[0_0_30px_rgba(37,99,235,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-gradient text-white border-transparent shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Hashing Formulas & Algorithms
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Quick Reference Field Guide</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playModalClose();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white dark:bg-[#111827]">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50/70 dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs dark:shadow-[0_0_12px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {topic.icon}
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{topic.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">{topic.desc}</p>
              <div className="flex items-center gap-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-blue-300 shadow-2xs">
                <span className="text-[#2563EB] dark:text-blue-400 text-[11px] uppercase tracking-wider font-sans">Formula:</span>
                <span>{topic.formula}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between">
          {onOpenFullLearn ? (
            <button
              onClick={() => {
                soundManager.playPrimaryClick();
                onClose();
                onOpenFullLearn();
              }}
              className="btn-modern-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>Open Full Theory Guide</span>
            </button>
          ) : <div />}

          <button
            onClick={() => {
              soundManager.playModalClose();
              onClose();
            }}
            className="btn-modern-primary px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
