import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';

import {
  ASYNC_STORAGE_DEVICE_ID_KEY,
  ASYNC_STORAGE_DEVICE_STATE,
} from '@/src/lib/constants/async-storage-keys';
import { mqttService } from '@/src/lib/mqtt';
import { Schedule } from '@/src/lib/types/schedule';
import { TScheduleItem } from '@/src/lib/types/schedule-item';
import { deviceStateSchema } from '@/src/lib/validation/device-state-schema';

const SYNC_TIMEOUT_MS = 10000; // 10s
const REFETCH_INTERVAL_MS = 20000; // 20s

class DeviceStore {
  deviceId: string | null = null;
  isConnected: boolean = false; // MQTT connection state
  schedule: Schedule = new Schedule();
  lastFedTime: Date | null = null;
  isSynced: boolean = false;
  isSyncError: boolean = false;

  private _timeoutId: number = 0;
  private _refetchIntervalId: number = 0;

  constructor() {
    makeAutoObservable(this, { _timeoutId: false } as any); // as any to ignore private field
  }

  async init() {
    // get stored data from storage
    const dataJson = await AsyncStorage.getItem(ASYNC_STORAGE_DEVICE_STATE);
    const validation = deviceStateSchema.safeParse(dataJson);
    if (validation.success) {
      this.schedule.setSchedule(validation.data.schedule);
      this.lastFedTime = validation.data.lastFedTime;
    }

    // try to get deviceId from storage and connect with it to MQTT
    const id = await AsyncStorage.getItem(ASYNC_STORAGE_DEVICE_ID_KEY);
    if (!id) return;

    runInAction(() => {
      this.deviceId = id;
    });

    this.connectMqtt();
    this.startSync();
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
        this.isSynced = true;
        this.isSyncError = false;
      });

      // clear timeout and interval for sync errors
      this.stopSync();

      AsyncStorage.setItem(ASYNC_STORAGE_DEVICE_STATE, JSON.stringify(state));
    });
  }

  handleMessage(topic: string, payload: string) {
    console.log('handleMessage: ', topic, payload);
  }

  // define as arrow functions to preserve "this" context when passing method as onClick handler
  feedNow = () => {
    if (!this.deviceId) return;

    mqttService.feedNow(this.deviceId);
    this.startSync();
  };

  moveNextFeedToNow = () => {
    if (!this.deviceId) return;

    mqttService.moveNextFeedToNow(this.deviceId);
    this.startSync();
  };

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

    this.startSync();
    mqttService.updateSchedule(this.deviceId, this.schedule);
  }

  private startSync() {
    console.log('started sync');
    runInAction(() => {
      this.isSynced = false;
      this.isSyncError = false;
    });

    clearTimeout(this._timeoutId);
    clearInterval(this._refetchIntervalId);
    this._timeoutId = setTimeout(() => {
      // couldn't sync, start trying to refetch periodically
      runInAction(() => {
        this.isSyncError = true;
      });

      clearInterval(this._refetchIntervalId);
      this._refetchIntervalId = setInterval(() => {
        if (!this.deviceId) return;

        mqttService.requestState(this.deviceId);
      }, REFETCH_INTERVAL_MS);
    }, SYNC_TIMEOUT_MS);
  }

  private stopSync() {
    clearTimeout(this._timeoutId);
    clearInterval(this._refetchIntervalId);
  }
}

export const deviceStore = new DeviceStore();
