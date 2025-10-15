import React, { useEffect, useState } from "react";

type Scene = { _id?: string; name: string };
type Schedule = { _id?: string; sceneId: string; time: string; days: number[]; enabled: boolean; name?: string };

const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function SchedulesPanel(){
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [formScene, setFormScene] = useState("");
  const [formTime, setFormTime] = useState("19:00");
  const [formDays, setFormDays] = useState<number[]>([1,2,3,4,5]);
  const [loading, setLoading] = useState(true);

  async function load(){
    setLoading(true);
    try {
      const s = await fetch("/api/scenes").then(r=>r.json());
      setScenes(Array.isArray(s)?s:s.scenes||[]);
      const sch = await fetch("/api/schedules").then(r=>r.json());
      setSchedules(Array.isArray(sch)?sch:sch.schedules||[]);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  useEffect(()=>{ load(); },[]);

  async function createSchedule(e?:React.FormEvent){
    e?.preventDefault();
    if(!formScene) return;
    await fetch("/api/schedules",{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sceneId: formScene, time: formTime, days: formDays })});
    setFormScene(''); setFormTime('19:00'); setFormDays([1,2,3,4,5]);
    await load();
  }

  async function toggleEnable(id:string, enabled:boolean){
    await fetch(`/api/schedules/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ enabled })});
    await load();
  }

  async function deleteSchedule(id:string){
    if(!confirm('Delete schedule?')) return;
    await fetch(`/api/schedules/${id}`, { method:'DELETE' });
    await load();
  }

  function toggleDay(day:number){
    setFormDays(prev => prev.includes(day) ? prev.filter(d=>d!==day) : [...prev, day].sort());
  }

  return (
    <section className="panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div className="h2">Schedules</div>
        <div className="small-muted">{schedules.length} schedules</div>
      </div>

      <form onSubmit={createSchedule} style={{marginBottom:12}}>
        <select value={formScene} onChange={e=>setFormScene(e.target.value)} style={{width:'100%', marginBottom:8}}>
          <option value="">Select scene</option>
          {scenes.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
          <input type="time" value={formTime} onChange={e=>setFormTime(e.target.value)} style={{padding:8}} />
          <div style={{display:'flex', gap:6}}>
            {DAY_LABELS.map((lab, idx) => (
              <button key={lab} type="button" onClick={()=>toggleDay(idx)} className="btn" style={{padding:'6px 8px', background: formDays.includes(idx) ? 'var(--accent)' : 'transparent', color: formDays.includes(idx) ? 'white' : 'inherit'}}>
                {lab}
              </button>
            ))}
          </div>
          <button className="btn btn-primary">Create</button>
        </div>
      </form>

      {loading ? <div className="skeleton" style={{height:40}} /> : (
        <div className="space-y">
          {schedules.length===0 && <div className="small-muted">No schedules</div>}
          {schedules.map(s => (
            <div key={s._id} className="item">
              <div>
                <div className="font-medium">{s.name ?? `Scene ${s.sceneId}`}</div>
                <div className="small-muted">{s.time} • {s.days.map(d => DAY_LABELS[d]).join(', ')}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn" onClick={()=>toggleEnable(s._id!, !s.enabled)}>{s.enabled ? 'Disable' : 'Enable'}</button>
                <button className="btn btn-danger" onClick={()=>deleteSchedule(s._id!)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
