import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';

import { ASYNC_STORAGE_DEVICE_ID_KEY } from '@/src/lib/constants/async-storage/device-id-key';
import { mqttService } from '@/src/lib/mqtt';

// import { mqttService } from '../services/MqttService';

// TODO: move
interface ScheduleItem {
  hour: number;
  minute: number;
  weight: number;
  enabled: boolean;
}

class DeviceStore {
  deviceId: string | null = null;
  isConnected: boolean = false; // MQTT connection state
  schedule: ScheduleItem[] = [];
  lastFedTime: string | null = null;

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

    // mqttService;

    mqttService.onConnect(() => {
      runInAction(() => {
        this.isConnected = true;
      });

      if (!this.deviceId) return;
      mqttService.requestState(this.deviceId);
    });

    mqttService.onMessage((topic, payload) => {
      console.log('mobx onMessage', topic, payload);
      this.handleMessage(topic, payload);
    });

    // mqttService.onStateUpdate(); TODO:
  }

  handleMessage(topic: string, payload: string) {
    runInAction(() => {
      // if (topic.includes('status')) {
      //   if (payload.lastFed) this.lastFedTime = payload.lastFed;
      //   if (payload.schedule) this.schedule = payload.schedule;
      // }
    });
  }

  feedNow() {
    if (!this.deviceId) return;
    mqttService.feedNow(this.deviceId);
  }

  moveNextFeedToNow() {
    if (!this.deviceId) return;
    mqttService.moveNextFeedToNow(this.deviceId);
  }

  updateSchedule(newSchedule: ScheduleItem[]) {
    this.schedule = newSchedule;
    // mqttService.publish('update-schedule', { schedule: newSchedule }); TODO
  }

  async setDeviceId(id: string) {
    this.deviceId = id;
    await AsyncStorage.setItem('feeder_device_id', id);
    this.connectMqtt();
  }
}

export const deviceStore = new DeviceStore();
