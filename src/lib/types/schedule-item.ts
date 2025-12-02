export enum EFeedingState {
  Disabled,
  DisabledForNextFeed,
  Enabled,
}

export type TScheduleItem = {
  feedTimeMinutes: number;
  state: EFeedingState;
};
