import React, { useEffect, useState } from "react";

type Device = { _id?: string; name: string; room: string; type: string; on: boolean };

export default function DevicesPanel() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("light");

  const [filterRoom, setFilterRoom] = useState<string | "">("");
  const [filterType, setFilterType] = useState<string | "">("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : data.devices ?? []);
    } catch (err) {
      console.error("Failed to load devices", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000); // refresh every 5s
    return () => clearInterval(iv);
  }, []);

  async function createDevice(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !room.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), room: room.trim(), type }),
      });
      setName("");
      setRoom("");
      setType("light");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function toggleDevice(id: string) {
    // optimistic
    setDevices(prev => prev.map(d => (d._id === id ? { ...d, on: !d.on } : d)));
    try {
      await fetch(`/api/devices/${id}/toggle`, { method: "POST" });
      await load();
    } catch (err) {
      console.error(err);
      await load();
    }
  }

  async function deleteDevice(id: string) {
    if (!confirm("Delete this device?")) return;
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  const rooms = Array.from(new Set(devices.map(d => d.room).filter(Boolean)));
  const types = Array.from(new Set(devices.map(d => d.type).filter(Boolean)));
  const filtered = devices.filter(d => {
    if (filterRoom && d.room !== filterRoom) return false;
    if (filterType && d.type !== filterType) return false;
    return true;
  });

  return (
    <section className="panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div>
          <div className="h2">Devices</div>
          <div className="small-muted" style={{marginTop:4}}>Manage your devices by room and type</div>
        </div>

        <div className="controls">
          <select value={filterRoom} onChange={e=>setFilterRoom(e.target.value)} style={{padding:8, borderRadius:8}}>
            <option value="">All rooms</option>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{padding:8, borderRadius:8}}>
            <option value="">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn" onClick={()=>{ setFilterRoom(''); setFilterType(''); }}>Clear</button>
        </div>
      </div>

      <form onSubmit={createDevice} style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
        <input type="text" placeholder="Device name" value={name} onChange={e=>setName(e.target.value)} style={{flex:'1 1 200px'}} />
        <input type="text" placeholder="Room (e.g. Living Room)" value={room} onChange={e=>setRoom(e.target.value)} style={{width:200}} />
        <select value={type} onChange={e=>setType(e.target.value)} style={{width:150}}>
          <option value="light">Light</option>
          <option value="plug">Smart Plug</option>
          <option value="thermostat">Thermostat</option>
        </select>
        <button className="btn btn-primary" disabled={creating}>{creating ? "Creating…" : "Create"}</button>
      </form>

      {loading ? (
        <div className="space-y">
          <div className="skeleton" style={{height:40}}></div>
          <div className="skeleton" style={{height:40}}></div>
        </div>
      ) : (
        <div className="space-y">
          {filtered.length === 0 && <div className="small-muted">No devices found</div>}
          {filtered.map(d => (
            <div key={d._id} className="item">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="small-muted">{d.room} • {d.type}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className={`badge ${d.on ? 'badge-on' : 'badge-off'}`}>{d.on ? 'ON' : 'OFF'}</span>
                <button className="btn" onClick={()=>toggleDevice(d._id!)}>{d.on ? 'Turn Off' : 'Turn On'}</button>
                <button className="btn btn-danger" onClick={()=>deleteDevice(d._id!)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
