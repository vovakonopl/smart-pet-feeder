export enum FeedingState {
  Disabled = 'Disabled',
  DisabledForNextFeed = 'DisabledForNextFeed',
  Enabled = 'Enabled',
}

export type FeedingScheduleItem = {
  timeGmt: string;
  state: FeedingState;
};
