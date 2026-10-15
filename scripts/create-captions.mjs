import { writeFile, mkdir } from 'node:fs/promises';
// These caption drafts are machine transcriptions; the business must review words and timing.
const { videos } = await import('../src/data/videos.ts');
await mkdir('public/captions',{recursive:true});
function stamp(seconds){return new Date(seconds*1000).toISOString().slice(11,23);}
for(const [i,video] of videos.entries()){
 const lines=video.transcript.split('\n');let cursor=0;const total=lines.reduce((sum,line)=>sum+line.length,0);
 const cues=lines.map((line,index)=>{const end=index===lines.length-1?video.duration:cursor+video.duration*line.length/total;const cue=`${stamp(cursor)} --> ${stamp(end)}\n${line}\n`;cursor=end;return cue;});
 await writeFile(`public/captions/video-${i+1}-hi.vtt`,'WEBVTT\n\n'+cues.join('\n'));
}
