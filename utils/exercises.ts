export type TrajectoryType =
  | 'vertical'
  | 'horizontal'
  | 'diagonal1'
  | 'diagonal2'
  | 'square'
  | 'butterflyH'
  | 'butterflyV'
  | 'circleCW'
  | 'circleCCW'
  | 'zigzag'
  | 'zigzagH'
  | 'globe';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  trajectory: TrajectoryType;
  duration: number; // in seconds
}

export const EXERCISES: Exercise[] = [
  { id: '1', name: 'Vertical', description: 'Move eyes bottom to top, then top to bottom.', trajectory: 'vertical', duration: 30 },
  { id: '2', name: 'Horizontal', description: 'Move eyes left to right, then right to left.', trajectory: 'horizontal', duration: 30 },
  { id: '3', name: 'Diagonal BL-TR', description: 'Bottom-left to top-right and back.', trajectory: 'diagonal1', duration: 30 },
  { id: '4', name: 'Diagonal BR-TL', description: 'Bottom-right to top-left and back.', trajectory: 'diagonal2', duration: 30 },
  { id: '5', name: 'Square', description: 'Trace a square clockwise.', trajectory: 'square', duration: 30 },
  { id: '6', name: 'Butterfly Horizontal', description: 'Trace a horizontal infinity sign.', trajectory: 'butterflyH', duration: 30 },
  { id: '7', name: 'Butterfly Vertical', description: 'Trace a vertical infinity sign.', trajectory: 'butterflyV', duration: 30 },
  { id: '8', name: 'Circle', description: 'Circle clockwise then counter-clockwise.', trajectory: 'circleCW', duration: 30 },
  { id: '9', name: 'Zigzag Vertical', description: 'Trace a zigzag line.', trajectory: 'zigzag', duration: 30 },
  { id: '10', name: 'Zigzag Horizontal', description: 'Trace a zigzag line.', trajectory: 'zigzagH', duration: 30 },
  { id: '11', name: 'Globe Equator', description: 'Focus on lines near the horizon.', trajectory: 'globe', duration: 30 },
];
