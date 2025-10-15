import DevicesPanel from '../components/DevicesPanel'
import ScenesPanel from '../components/ScenesPanel'
import SchedulesPanel from '../components/SchedulesPanel'
import ActivityLog from '../components/ActivityLog'

export default function Home(){ return (
  <main style={{maxWidth:900, margin:'0 auto'}}>
    <h1>HomeBuddy</h1>
    <div style={{display:'flex',gap:20}}>
      <div style={{flex:2}}>
        <div className="panel"><DevicesPanel/></div>
        <div className="panel" style={{marginTop:12}}><ScenesPanel/></div>
        <div className="panel" style={{marginTop:12}}><SchedulesPanel/></div>
      </div>
      <div style={{flex:1}}><div className="panel"><ActivityLog/></div></div>
    </div>
  </main>
) }
