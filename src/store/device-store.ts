import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';

import { ASYNC_STORAGE_DEVICE_ID_KEY } from '@/src/lib/constants/async-storage-keys';
import { mqttService } from '@/src/lib/mqtt';
import { Schedule } from '@/src/lib/types/schedule';
import { EFeedingState, TScheduleItem } from '@/src/lib/types/schedule-item';

class DeviceStore {
  deviceId: string | null = null;
  isConnected: boolean = false; // MQTT connection state
  schedule: Schedule = new Schedule();
  lastFedTime: Date | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    const id = await AsyncStorage.getItem(ASYNC_STORAGE_DEVICE_ID_KEY);
    if (!id) return;

    runInAction(() => {
      this.deviceId = id;
    });

    this.connectMqtt();
  }

  connectMqtt() {
    if (!this.deviceId) return;

    mqttService.onConnect(() => {
      runInAction(() => {
        this.isConnected = true;
      });

      if (!this.deviceId) return;
      mqttService.requestState(this.deviceId);
    });

    mqttService.onMessage((topic, payload) => {
      this.handleMessage(topic, payload);
    });

    mqttService.onStateUpdate(this.deviceId, (state) => {
      runInAction(() => {
        this.lastFedTime = state.lastFedTime;
        this.schedule.setSchedule(state.schedule);
      });
    });
  }

  handleMessage(topic: string, payload: string) {
    console.log('handleMessage: ', topic, payload);
  }

  feedNow() {
    if (!this.deviceId) return;
    mqttService.feedNow(this.deviceId);
  }

  moveNextFeedToNow() {
    if (!this.deviceId) return;
    mqttService.moveNextFeedToNow(this.deviceId);
  }

  updateSchedule(newSchedule: Schedule) {
    runInAction(() => {
      this.schedule = newSchedule;
    });
    this.publishSchedule();
  }

  scheduleAddItem(item: TScheduleItem) {
    runInAction(() => {
      this.schedule.addItem(item);
    });
    this.publishSchedule();
  }

  deleteItemAtMinutes(minutes: number) {
    runInAction(() => {
      this.schedule.deleteItemAtMinutes(minutes);
    });
    this.publishSchedule();
  }

  updateItemAtMinutes(minutes: number, data: Partial<TScheduleItem>) {
    runInAction(() => {
      this.schedule.updateItemAtMinutes(minutes, data);
    });
    this.publishSchedule();
  }

  async setDeviceId(id: string) {
    // TODO: unsubscribe from previous deviceId MQTT topics
    runInAction(() => {
      this.deviceId = id;
    });

    await AsyncStorage.setItem(ASYNC_STORAGE_DEVICE_ID_KEY, id);
    this.connectMqtt();
  }

  private publishSchedule() {
    if (!this.deviceId) return;
    mqttService.updateSchedule(this.deviceId, this.schedule);
  }
}

export const deviceStore = new DeviceStore();
