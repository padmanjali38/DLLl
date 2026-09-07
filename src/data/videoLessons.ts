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
    title: 'INTRODUCTION TO DOUBLY LINKED LISTS',
    nowPlayingTitle: 'INTRODUCTION TO DOUBLY LINKED LISTS',
    description: 'Master the fundamentals of Doubly Linked Lists: node structure with data, prev & next pointers, head and tail bounds, and bi-directional traversal.',
    topics: [
      'Node Structure [prev | data | next]',
      'Head and Tail Pointers',
      'Bi-directional Traversal',
      'Dynamic Heap Memory vs Arrays',
    ],
    videoSrc: '/videos/introduction.mp4',
    filename: 'introduction.mp4',
  },
  {
    id: 'lesson-02',
    lessonNumber: 'LESSON 02',
    title: 'POINTER MANIPULATION & OPERATIONS',
    nowPlayingTitle: 'POINTER MANIPULATION & OPERATIONS',
    description: 'Learn step-by-step pointer rewiring for Insertion at Head/Tail/Middle and Deletion of nodes without memory leaks.',
    topics: [
      'Insert at Head & Tail in O(1)',
      'Insert at Middle Position (4 Pointers)',
      'Node Deletion & Bypass Wiring',
      'Edge Cases (Empty & Single Node)',
    ],
    videoSrc: '/videos/collision.mp4',
    filename: 'collision.mp4',
  },
];
