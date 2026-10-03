export interface LessonItem {
  id: 'lesson-01' | 'lesson-02';
  lessonNumber: string;
  title: string;
  nowPlayingTitle: string;
  description: string;
  topics: string[];
  videoSrc: string;
  filename: string;
}

export const VIDEO_LESSONS: LessonItem[] = [
  {
    id: 'lesson-01',
    lessonNumber: 'LESSON 01',
    title: 'What is DLL? & DLL Insertion',
    nowPlayingTitle: 'What is DLL? & DLL Insertion',
    description: 'Learn what a Doubly Linked List is, understand its node structure and head/tail boundaries, and perform insertion at the head, tail, and any position.',
    topics: [
      'What is DLL?',
      'DLL Structure',
      'Head and Tail Boundaries',
      'Insertion at Head, Tail, and Any Position',
    ],
    videoSrc: '/videos/dll/part1.mp4',
    filename: 'part1.mp4',
  },
  {
    id: 'lesson-02',
    lessonNumber: 'LESSON 02',
    title: 'Traversal & DLL Deletion',
    nowPlayingTitle: 'Traversal & DLL Deletion',
    description: 'Learn how to traverse a Doubly Linked List in both directions and perform deletion at the head, tail, and any position.',
    topics: [
      'Bidirectional Traversal',
      'Deletion at Head',
      'Deletion at Tail',
      'Deletion at Any Position',
    ],
    videoSrc: '/videos/dll/part2.mp4',
    filename: 'part2.mp4',
  },
];



