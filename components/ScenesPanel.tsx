import React, { useEffect, useState } from "react";

type Device = { _id?: string; name: string; room: string; type: string; on: boolean };
type Scene = { _id?: string; name: string; actions: { deviceId: string; on: boolean }[] };

export default function ScenesPanel() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const d = await fetch("/api/devices").then(r=>r.json());
      setDevices(Array.isArray(d) ? d : d.devices ?? []);
      const s = await fetch("/api/scenes").then(r=>r.json());
      setScenes(Array.isArray(s) ? s : s.scenes ?? []);
    } catch (err) { console.error(err); }
  }

  useEffect(()=>{ load(); }, []);

  function togglePick(deviceId:string){ setSelected(prev=>({...prev, [deviceId]: !prev[deviceId]})); }

  async function createScene(e?:React.FormEvent){
    e?.preventDefault();
    if(!name.trim()) return;
    setCreating(true);
    try {
      const actions = Object.entries(selected).filter(([k,v])=>v).map(([k])=>({deviceId:k, on:true}));
      await fetch("/api/scenes", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: name.trim(), actions })});
      setName(""); setSelected({}); await load();
    } catch (err) { console.error(err); } finally { setCreating(false); }
  }

  async function runScene(id:string){
    await fetch("/api/run-scene", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sceneId:id })});
    // quick refresh
    setTimeout(load, 400);
  }

  async function deleteScene(id:string){
    if(!confirm('Delete scene?')) return;
    await fetch(`/api/scenes/${id}`, { method:'DELETE' }); await load();
  }

  return (
    <section className="panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div className="h2">Scenes</div>
        <div className="small-muted">{scenes.length} scenes</div>
      </div>

      <form onSubmit={createScene} style={{marginBottom:12}}>
        <input type="text" placeholder="Scene name" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', marginBottom:8}} />
        <div className="small-muted" style={{marginBottom:8}}>Choose devices (they will be turned ON by default):</div>
        <div style={{display:'grid', gap:8, maxHeight:160, overflow:'auto', marginBottom:8}}>
          {devices.map(d => (
            <label key={d._id} style={{display:'flex', gap:8, alignItems:'center'}}>
              <input type="checkbox" checked={!!selected[d._id!]} onChange={()=>togglePick(d._id!)} />
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="small-muted">{d.room}</div>
              </div>
            </label>
          ))}
          {devices.length===0 && <div className="small-muted">No devices — add some above</div>}
        </div>

        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Scene'}</button>
          <button type="button" className="btn" onClick={()=>{ setName(''); setSelected({}); }}>Reset</button>
        </div>
      </form>

      <div className="space-y">
        {scenes.length===0 && <div className="small-muted">No scenes yet</div>}
        {scenes.map(s => (
          <div key={s._id} className="item">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="small-muted">{s.actions.length} actions</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={()=>runScene(s._id!)}>Run</button>
              <button className="btn btn-danger" onClick={()=>deleteScene(s._id!)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
