import mqtt from 'mqtt';

import { TOPICS } from '@/src/lib/constants/mqtt-topics';
import { Schedule } from '@/src/lib/types/schedule';
import {
  deviceStateSchema,
  TDeviceState,
} from '@/src/lib/validation/device-state-schema';

type MessageHandler = (topic: string, payload: string) => void;

class MqttService {
  private client: mqtt.MqttClient;
  private onConnectHandlers = new Set<() => void>();
  private onMessageHandlers = new Set<MessageHandler>();

  constructor() {
    const id = Math.random().toString(16).slice(2, 10);
    this.client = mqtt.connect(process.env.EXPO_PUBLIC_MQTT_URL!, {
      clientId: `app-${id}`,
      username: process.env.EXPO_PUBLIC_MQTT_USER,
      password: process.env.EXPO_PUBLIC_MQTT_PASS,
      reconnectPeriod: 5000,
      clean: true,
    });

    this.client.on('connect', () => {
      console.log('MQTT: on connect');
      this.onConnectHandlers.forEach((cb) => cb());
    });

    this.client.on('message', (topic, payload) => {
      console.log('MQTT: on message', topic, payload.toString());
      this.onMessageHandlers.forEach((cb) => cb(topic, payload.toString()));
    });
  }

  subscribe(deviceId: string, topic: string) {
    this.client.subscribe(
      `${process.env.EXPO_PUBLIC_MQTT_PREFIX}/${deviceId}/${topic}`,
    );
  }

  unsubscribe(deviceId: string, topic: string) {
    this.client.unsubscribe(
      `${process.env.EXPO_PUBLIC_MQTT_PREFIX}/${deviceId}/${topic}`,
    );
  }

  publish(
    deviceId: string,
    topic: string,
    payload: unknown,
    options?: mqtt.IClientPublishOptions,
  ) {
    if (!this.client.connected) return;

    this.client.publish(
      `${process.env.EXPO_PUBLIC_MQTT_PREFIX}/${deviceId}/${topic}`,
      JSON.stringify(payload),
      { qos: 1, ...options },
    );
  }

  onConnect(cb: () => void) {
    this.onConnectHandlers.add(cb);
    return () => this.onConnectHandlers.delete(cb);
  }

  onMessage(cb: MessageHandler) {
    this.onMessageHandlers.add(cb);
    return () => this.onMessageHandlers.delete(cb);
  }

  requestState(deviceId: string) {
    this.publish(deviceId, TOPICS.statusRequest, undefined);
  }

  feedNow(deviceId: string) {
    this.publish(deviceId, TOPICS.feedNow, undefined, { qos: 2 });
  }

  moveNextFeedToNow(deviceId: string) {
    this.publish(deviceId, TOPICS.moveNextFeedingForNow, undefined, { qos: 2 });
  }

  updateSchedule(deviceId: string, schedule: Schedule) {
    const scheduleItemsJson = JSON.stringify(schedule.items);
    this.publish(deviceId, TOPICS.scheduleUpdate, scheduleItemsJson);
  }

  onStateUpdate(deviceId: string, cb: (state: TDeviceState) => void) {
    this.subscribe(deviceId, TOPICS.statusResponse);

    const handler = (_: string, payload: string) => {
      const validation = deviceStateSchema.safeParse(payload);
      if (!validation.success) {
        console.log('onStateUpdate: invalid payload received');
        return;
      }

      cb(validation.data);
    };

    this.onMessageHandlers.add(handler);

    return () => {
      this.unsubscribe(deviceId, TOPICS.statusResponse);
      this.onMessageHandlers.delete(handler);
    };
  }
}

export const mqttService = new MqttService();
