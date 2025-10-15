import React, { useEffect, useRef, useState } from "react";

type Activity = { _id?: string; ts?: string; text: string };

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const sRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(d => setActivities(d || []));

    const s = new EventSource("/api/events");
    sRef.current = s;
    s.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setActivities(prev => [data, ...prev].slice(0, 500));
      } catch (err) {
        console.error(err);
      }
    };
    s.onerror = (e) => {
      console.warn("SSE error", e);
      s.close();
    };
    return () => { s.close(); };
  }, []);

  return (
    <section className="panel">
      <div className="h2">Activity Log</div>
      <div className="scroll-y" style={{marginTop:12}}>
        {activities.length === 0 && <div className="small-muted">No activity yet</div>}
        {activities.map(a => (
          <div key={a._id || a.ts} style={{borderBottom:'1px solid #eef6fb', padding:'10px 0'}}>
            <div className="small-muted" style={{fontSize:12}}>{new Date(a.ts || new Date()).toLocaleString()}</div>
            <div style={{marginTop:6}}>{a.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
