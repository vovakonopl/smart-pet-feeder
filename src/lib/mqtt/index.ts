import mqtt from 'mqtt';

import { TOPICS } from '@/src/lib/constants/mqtt-topics';

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

  subscribe(topic: string) {
    this.client.subscribe(topic);
  }

  publish(topic: string, payload: unknown) {
    if (!this.client.connected) return;

    this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
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
    this.publish(`feeder/${deviceId}/${TOPICS.statusRequest}`, {});
  }

  feedNow(deviceId: string) {
    this.publish(`feeder/${deviceId}/${TOPICS.feedNow}`, {});
  }

  moveNextFeedToNow(deviceId: string) {
    this.publish(`feeder/${deviceId}/${TOPICS.moveNextFeedingForNow}`, {});
  }

  // TODO:
  // updateSchedule(deviceId: string, schedule: Schedule) {}

  // TODO:
  // onStateUpdate(cb: (status) => void) {}
}

export const mqttService = new MqttService();
