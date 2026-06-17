export type RoleId = 'archaeologist' | 'historian' | 'worker' | 'descendant';

export interface Role {
  id: RoleId;
  name: string;
  quadrant: 1 | 2 | 3 | 4;
  iconName: string;
  shortTitle: string;
  description: string;
}

export interface Quote {
  id: number;
  text: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  primarySpeaker: string;
  associatedRoles: RoleId[]; // Roles likely to say/relate to this quote
  hint: string;
}

export interface RatingState {
  isLiked: boolean | null; // true = thumbs up, false = thumbs down, null = unrated
  explanation: string;
}

export type Ratings = Record<number, RatingState>;

export interface StudentSession {
  roleSelected: RoleId | null;
  ratings: Ratings;
}
