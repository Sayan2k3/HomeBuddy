// pages/api/_store.ts
import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';

type Device = { id: string; name: string; room: string; type: string; on: boolean };
type Scene = { id: string; name: string; actions: { deviceId: string; on: boolean }[] };
type Schedule = { id: string; name?: string; sceneId: string; time: string; days: number[]; enabled: boolean };

const emitter = new EventEmitter();

const store = {
  devices: [] as Device[],
  scenes: [] as Scene[],
  schedules: [] as Schedule[],
  activities: [] as { id: string; ts: string; text: string }[]
};

function addActivity(text: string) {
  const a = { id: uuid(), ts: new Date().toISOString(), text };
  store.activities.unshift(a);
  // keep recent
  if (store.activities.length > 500) store.activities.pop();
  // notify SSE listeners
  emitter.emit('activity', a);
}

// run a scene: apply actions to devices and log events
function runScene(sceneId: string) {
  const scene = store.scenes.find(s => s.id === sceneId);
  if (!scene) {
    addActivity(`Scene ${sceneId} not found`);
    return;
  }
  addActivity(`Running scene: ${scene.name}`);
  scene.actions.forEach(act => {
    const dev = store.devices.find(d => d.id === act.deviceId);
    if (!dev) {
      addActivity(`  Device ${act.deviceId} not found for scene ${scene.name}`);
      return;
    }
    dev.on = act.on;
    addActivity(`  Device ${dev.name} -> ${act.on ? 'ON' : 'OFF'}`);
  });
}

// simple scheduler loop that checks schedules every 30 seconds
let schedulerStarted = false;
function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  setInterval(() => {
    try {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0,5); // "HH:MM"
      const day = (now.getDay() + 6) % 7; // convert Sunday=0 to 6, Monday=0 ... but here we'll use 0=Mon
      // iterate schedules
      store.schedules.forEach(s => {
        if (!s.enabled) return;
        // if schedule time equals now and today is in schedule.days
        if (s.time === hhmm && s.days.includes(day)) {
          addActivity(`Scheduler triggered schedule ${s.id}`);
          runScene(s.sceneId);
        }
      });
    } catch (err) {
      console.error('Scheduler error', err);
    }
  }, 30_000); // every 30 sec
}

// ensure scheduler starts when module is imported
startScheduler();

export { store, addActivity, runScene, emitter, startScheduler };
