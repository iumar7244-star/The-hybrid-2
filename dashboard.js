const $=id=>document.getElementById(id);const KEY='ius_sons_local_schools_v1',SESSION='ius_sons_local_session_v1';
const load=()=>JSON.parse(localStorage.getItem(KEY)||'[]');const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
let schools=load(),SCHOOL=schools.find(s=>s.id===localStorage.getItem(SESSION));
if(!SCHOOL){location.href='auth.html?view=login'}
function persist(){schools=load();const i=schools.findIndex(s=>s.id===SCHOOL.id);if(i>=0){schools[i]=SCHOOL;save(schools)}}
function esc(x){return String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())}
function refreshBadge(){ $('schoolBadgeMini').innerHTML=`${SCHOOL.badge_url?`<img src="${SCHOOL.badge_url}">`:''}<span>${esc(SCHOOL.name)}</span>` }
function refreshAll(){refreshBadge();loadOverview();loadYears();loadClasses();loadSubjects();loadTeachers();loadStudents();loadResultSelectors();$('pf-name').value=SCHOOL.name||'';$('pf-location').value=SCHOOL.location||'';if(SCHOOL.badge_url){$('pf-badge-preview').src=SCHOOL.badge_url;$('pf-badge-preview').style.display='block'}}
// navigation
document.querySelectorAll('.navlink[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.navlink').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.style.display='none');$('view-'+b.dataset.view).style.display='block';if(b.dataset.view==='students')loadStudents();if(b.dataset.view==='results')loadResultSelectors()});
$('logoutBtn').onclick=()=>{localStorage.removeItem(SESSION);location.href='auth.html?view=login'};
function loadOverview(){$('overviewCards').innerHTML=`<div class="card"><b>${SCHOOL.students.length}</b><span>Students</span></div><div class="card"><b>${SCHOOL.years.length}</b><span>Academic Years</span></div><div class="card"><b>${SCHOOL.classes.length}</b><span>Classes</span></div>`}
$('pf-badge').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{SCHOOL.badge_url=r.result;$('pf-badge-preview').src=r.result;$('pf-badge-preview').style.display='block'};r.readAsDataURL(f)};
$('pf-save').onclick=()=>{SCHOOL.name=$('pf-name').value.trim()||SCHOOL.name;SCHOOL.location=$('pf-location').value.trim();persist();refreshBadge();$('pf-msg').textContent='Saved on this device.'};
function loadYears(){let a=SCHOOL.years;$('yr-body').innerHTML=a.map(y=>`<tr><td>${y.year}</td><td>${y.status}</td><td><button class="gray yr-toggle" data-id="${y.id}">${y.status==='active'?'Close':'Reopen'}</button></td></tr>`).join('')||'<tr><td colspan="3">No academic years yet.</td></tr>';document.querySelectorAll('.yr-toggle').forEach(b=>b.onclick=()=>{let y=a.find(x=>x.id===b.dataset.id);y.status=y.status==='active'?'closed':'active';persist();loadYears();loadResultSelectors()});$('st-year').innerHTML=a.map(y=>`<option value="${y.id}">${y.year}</option>`).join('');$('cl-year').innerHTML=a.map(y=>`<option value="${y.id}">${y.year}</option>`).join('')}
$('yr-add').onclick=()=>{let y=parseInt($('yr-input').value,10);if(!y)return;if(SCHOOL.years.some(x=>x.year===y)){$('yr-input').value='';return}SCHOOL.years.push({id:uid(),year:y,status:'active'});SCHOOL.years.sort((a,b)=>b.year-a.year);$('yr-input').value='';persist();loadYears();loadOverview()};
function updateStreamOptions(){let c=SCHOOL.classes.find(x=>x.id===$('st-class').value);$('st-stream').innerHTML='<option value="">— none —</option>'+(c?.streams||[]).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}
function loadClasses(){let a=SCHOOL.classes;$('cl-list').innerHTML=a.map(c=>`<div class="student" data-id="${c.id}"><div class="student-head"><b>${esc(c.name)}</b><input class="stream-input" placeholder="Add stream e.g. East" style="max-width:160px"><button class="green stream-add">+ Stream</button><button class="gray cl-defsub">+ Category Subjects</button><button class="gray cl-showstudents">Show Students</button><button class="danger cl-remove">Remove Class</button></div><div class="streamTags">${(c.streams||[]).map(s=>`<span class="tag">${esc(s.name)}</span>`).join(' ')||"<span class='hint'>No streams — this class is not split.</span>"}</div><div class="classStudentList" style="display:none"></div></div>`).join('')||'<p>No classes yet.</p>';$('st-class').innerHTML=a.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');a.forEach(c=>{let card=document.querySelector(`#cl-list .student[data-id="${c.id}"]`);if(!card)return;card.querySelector('.stream-add').onclick=()=>{let n=card.querySelector('.stream-input').value.trim();if(!n)return;c.streams=c.streams||[];c.streams.push({id:uid(),name:n});persist();loadClasses();updateStreamOptions()};card.querySelector('.cl-defsub').onclick=()=>{const r=addDefaultSubjects(c);persist();loadSubjects();loadResultSelectors();$('cl-msg').style.color='#059669';$('cl-msg').textContent=r.created+r.linked?`${r.created+r.linked} subject(s) added to ${c.name}.`:`${c.name} already has all its category subjects.`};card.querySelector('.cl-remove').onclick=()=>{if(confirm(`Remove ${c.name}?`)){SCHOOL.classes=SCHOOL.classes.filter(x=>x.id!==c.id);SCHOOL.subjects=SCHOOL.subjects.filter(sub=>{const had=(sub.classes||[]).includes(c.id);sub.classes=(sub.classes||[]).filter(id=>id!==c.id);return !(had&&sub.classes.length===0)});persist();loadClasses();loadSubjects();loadResultSelectors();loadOverview()}};card.querySelector('.cl-showstudents').onclick=()=>{let l=card.querySelector('.classStudentList');l.style.display='block';let list=SCHOOL.students.filter(s=>s.classId===c.id);l.innerHTML=list.length?'<b>Students:</b> '+list.map(s=>`${esc(s.name)} (${esc(s.code)})`).join(', '):'<span class="hint">No students in this class.</span>'}});$('st-class').onchange=updateStreamOptions;if(a.length)updateStreamOptions()}
const DEFAULT_SUBJECTS={
  senior12:["English Language","Mathematics","Biology","Chemistry","Physics","Geography","History & Political Education","Entrepreneurship Education","Physical Education (PE)","General Science","Kiswahili"],
  senior34:["English Language","Mathematics","Biology","Chemistry","Physics","Geography","History & Political Education"],
  primary:["English","Mathematics","Integrated Science","Social Studies"],
  tp:["القرآن","التربية الإسلامية","الفقه","اللغة العربية"],
  tj:["الحفظ والتفسير","التلاوة والتجويد","الإملاء والخط","الأدب والنصوص","إنشاء والمطالعة","النحو والصرف","فقه العبادات","الحديث","العقيدة","التاريخ"],
  ts:["الحفظ والتفسير","التلاوة والتجويد","الإملاء والخط","الأدب والنصوص","إنشاء والمطالعة","النحو والصرف","فقه العبادات","الحديث","العقيدة","التاريخ","مصطلح الحديث","أصول الفقه","أصول التفسير","فقه المعاملات","الأديان والفرق"]
};
function addDefaultSubjects(cls){
  let created=0,linked=0;
  (DEFAULT_SUBJECTS[cls.category]||[]).forEach(name=>{
    const ex=SCHOOL.subjects.find(s=>String(s.name).trim().toLowerCase()===name.toLowerCase());
    if(!ex){SCHOOL.subjects.push({id:uid(),name,classes:[cls.id]});created++}
    else if(Array.isArray(ex.classes)&&ex.classes.length&&!ex.classes.includes(cls.id)){ex.classes.push(cls.id);linked++}
  });
  return {created,linked};
}
$('cl-add').onclick=()=>{let n=$('cl-input').value.trim();if(!n)return;if(SCHOOL.classes.some(c=>c.name.toLowerCase()===n.toLowerCase())){alert('That class already exists.');return}const cls={id:uid(),name:n,category:$('cl-category').value,streams:[]};SCHOOL.classes.push(cls);const r=addDefaultSubjects(cls);$('cl-input').value='';persist();loadClasses();loadSubjects();loadResultSelectors();loadOverview();$('cl-msg').style.color='#059669';$('cl-msg').textContent=`Class added. ${r.created+r.linked} subject(s) for ${$('cl-category').selectedOptions[0].text} were added automatically — see the Subjects tab.`};
function loadSubjects(){
  const all=SCHOOL.classes||[];
  const pick=$('sub-classes');
  if(pick){
    pick.innerHTML=all.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')||'<option disabled>No classes yet</option>';
  }
  $('sub-body').innerHTML=SCHOOL.subjects.map(s=>{
    const assigned=(s.classes||[]).map(id=>(SCHOOL.classes.find(c=>c.id===id)||{}).name).filter(Boolean);
    const shown=assigned.length?assigned.join(', '):'All classes';
    return `<tr><td>${esc(s.name)}</td><td>${esc(shown)}</td><td><button class="gray sub-edit" data-id="${s.id}">Edit Classes</button><button class="danger sub-remove" data-id="${s.id}">Remove</button></td></tr>`;
  }).join('')||'<tr><td colspan="3">No subjects yet.</td></tr>';
  document.querySelectorAll('.sub-remove').forEach(b=>b.onclick=()=>{if(!confirm('Remove this subject?'))return;SCHOOL.subjects=SCHOOL.subjects.filter(s=>s.id!==b.dataset.id);persist();loadSubjects();loadResultSelectors()});
  document.querySelectorAll('.sub-edit').forEach(b=>b.onclick=()=>{
    const sub=SCHOOL.subjects.find(x=>x.id===b.dataset.id); if(!sub||!pick)return;
    [...pick.options].forEach(o=>o.selected=(sub.classes||[]).includes(o.value));
    $('sub-input').value=sub.name;
    $('sub-input').dataset.editId=sub.id;
    $('sub-add').textContent='Save Subject';
    $('sub-input').focus();
  });
}
$('sub-add').onclick=()=>{
  let n=$('sub-input').value.trim();if(!n)return;
  const selected=[...($('sub-classes')?.selectedOptions||[])].map(o=>o.value);
  const editId=$('sub-input').dataset.editId;
  if(editId){
    const sub=SCHOOL.subjects.find(s=>s.id===editId); if(sub){sub.name=n;sub.classes=selected;}
    delete $('sub-input').dataset.editId;
    $('sub-add').textContent='+ Add Subject';
  }else{
    if(SCHOOL.subjects.some(s=>s.name.toLowerCase()===n.toLowerCase())){alert('That subject already exists.');return;}
    SCHOOL.subjects.push({id:uid(),name:n,classes:selected});
  }
  $('sub-input').value='';
  [...$('sub-classes').options].forEach(o=>o.selected=false);
  persist();loadSubjects();loadResultSelectors();
};

function loadTeachers(){$('tc-list').innerHTML=SCHOOL.teachers.map(t=>`<div class="student"><div class="student-head"><b>${esc(t.name)}</b><button class="danger tc-remove" data-id="${t.id}">Remove</button></div><div>${esc(t.email)} · ${esc(t.phone)}</div></div>`).join('')||'<p>No teachers yet.</p>';document.querySelectorAll('.tc-remove').forEach(b=>b.onclick=()=>{SCHOOL.teachers=SCHOOL.teachers.filter(t=>t.id!==b.dataset.id);persist();loadTeachers()})}
$('tc-add').onclick=()=>{let n=$('tc-name').value.trim();if(!n)return;SCHOOL.teachers.push({id:uid(),name:n,email:$('tc-email').value.trim(),phone:$('tc-phone').value.trim()});$('tc-name').value='';$('tc-email').value='';$('tc-phone').value='';persist();loadTeachers()};
function avatar(s,big){const c=big?'avatar big':'avatar';return s.photo&&/^data:image\//.test(s.photo)?`<img class="${c}" src="${s.photo}" alt="">`:`<span class="${c} ph">${esc((s.name||'?').trim().charAt(0).toUpperCase())}</span>`}
function loadStudents(){let list=SCHOOL.students;$('st-body').innerHTML=list.map(s=>`<tr data-id="${esc(s.id)}" class="st-row"><td>${avatar(s)}</td><td>${esc(s.code)}</td><td><a href="#" class="st-link">${esc(s.name)}</a></td><td>${esc(s.gender)}</td><td>${esc((SCHOOL.classes.find(c=>c.id===s.classId)||{}).name||'')}</td></tr>`).join('')||'<tr><td colspan="5">No students yet.</td></tr>';}
$('st-add').onclick=async()=>{let n=$('st-name').value.trim(),y=$('st-year').value,c=$('st-class').value;if(!n||!y||!c){$('st-msg').textContent='Enter name, academic year and class.';return}let photo='';const pf=$('st-photo').files[0];if(pf){try{photo=await shrinkPhoto(pf,240)}catch(err){$('st-msg').textContent=err.message;return}}let code=`${new Date().getFullYear()}-${String(SCHOOL.students.length+1).padStart(4,'0')}`;SCHOOL.students.push({id:uid(),code,name:n,gender:$('st-gender').value,yearId:y,classId:c,streamId:$('st-stream').value,photo});$('st-name').value='';$('st-photo').value='';persist();loadStudents();loadOverview();$('st-msg').textContent='Student added.'};
function loadResultSelectors(){let years=SCHOOL.years,classes=SCHOOL.classes;$('rs-year').innerHTML=years.map(y=>`<option value="${y.id}">${y.year}</option>`).join('');$('rs-class').innerHTML=classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');refreshResultSubjects()}
function refreshResultSubjects(){const classId=$('rs-class').value;const subs=SCHOOL.subjects.filter(s=>(s.classes||[]).length===0||(s.classes||[]).includes(classId));$('rs-subject').innerHTML=subs.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')||'<option value="">No subjects assigned</option>'}
$('rs-class').onchange=()=>{refreshResultSubjects()};
$('rs-load').onclick=()=>{let students=SCHOOL.students.filter(s=>s.yearId===$('rs-year').value&&s.classId===$('rs-class').value);$('rs-body').innerHTML=students.map(s=>{let r=SCHOOL.results.find(r=>r.studentId===s.id&&r.yearId===$('rs-year').value&&r.term===$('rs-term').value&&r.assessment===$('rs-assessment').value&&r.subjectId===$('rs-subject').value);let mark=r?.mark??'';return `<tr data-id="${s.id}"><td>${esc(s.code)}</td><td>${esc(s.name)}</td><td><input class="result-mark" type="number" min="0" max="100" value="${mark}" style="width:100px"></td><td class="result-grade">${mark===''?'—':grade(+mark)}</td></tr>`}).join('')||'<tr><td colspan="4">No students match.</td></tr>';document.querySelectorAll('.result-mark').forEach(i=>i.oninput=()=>{let v=i.value;i.closest('tr').querySelector('.result-grade').textContent=v===''?'—':grade(+v)})};
$('rs-save').onclick=()=>{document.querySelectorAll('#rs-body tr[data-id]').forEach(row=>{let mark=row.querySelector('.result-mark').value;SCHOOL.results=SCHOOL.results.filter(r=>!(r.studentId===row.dataset.id&&r.yearId===$('rs-year').value&&r.term===$('rs-term').value&&r.assessment===$('rs-assessment').value&&r.subjectId===$('rs-subject').value));if(mark!=='')SCHOOL.results.push({id:uid(),studentId:row.dataset.id,yearId:$('rs-year').value,term:$('rs-term').value,assessment:$('rs-assessment').value,subjectId:$('rs-subject').value,mark:+mark})});persist();$('rs-msg').textContent='Results saved on this device.'};
function grade(m){return m>=80?'A':m>=70?'B':m>=60?'C':m>=50?'D':'E'}
$('view-profile').style.display='block';document.querySelectorAll('.navlink').forEach(x=>x.classList.remove('active'));document.querySelector('.navlink[data-view="profile"]').classList.add('active');refreshAll();

$('bk-export').onclick=()=>{
  const blob=new Blob([JSON.stringify({app:'ius-sons',version:1,exported:new Date().toISOString(),school:SCHOOL})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='IUS-backup-'+(SCHOOL.school_code||SCHOOL.id).toString().replace(/[^\w-]/g,'')+'-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
  $('bk-msg').style.color='#059669';$('bk-msg').textContent='Backup downloaded.';
};
$('bk-import').onclick=()=>$('bk-file').click();
$('bk-file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(d.app!=='ius-sons'||!d.school||!d.school.id||!Array.isArray(d.school.students))throw new Error('bad');
      if(!confirm('Restore "'+d.school.name+'" from this backup? This replaces the data currently saved on this device for that school.'))return;
      const all=load(),i=all.findIndex(s=>s.id===d.school.id);
      if(i>=0)all[i]=d.school;else all.push(d.school);
      save(all);localStorage.setItem(SESSION,d.school.id);location.reload();
    }catch(err){$('bk-msg').style.color='#dc2626';$('bk-msg').textContent='That file is not a valid IUS AND SONS backup.'}
  };
  r.readAsText(f);e.target.value='';
};

/* ===== Student profile + photo ===== */
function shrinkPhoto(file,max){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(new Error('Could not read that file.'));fr.onload=()=>{const img=new Image();img.onerror=()=>rej(new Error('That file is not a valid image.'));img.onload=()=>{const W=max,H=Math.round(max*1.2),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);const k=Math.max(W/img.width,H/img.height),w=img.width*k,h=img.height*k;g.drawImage(img,(W-w)/2,(H-h)*0.25,w,h);res(c.toDataURL('image/jpeg',0.82))};img.src=fr.result};fr.readAsDataURL(file)})}
let PROFILE_ID=null;
const profStudent=()=>SCHOOL&&SCHOOL.students.find(s=>s.id===PROFILE_ID);
function paintProfile(){const s=profStudent();if(!s)return;$('sp-photo').innerHTML=avatar(s,true);$('sp-name').textContent=s.name;const cl=(SCHOOL.classes.find(c=>c.id===s.classId)||{}).name||'—',yr=(SCHOOL.years.find(y=>y.id===s.yearId)||{}).year||'—',st=((SCHOOL.classes.find(c=>c.id===s.classId)||{}).streams||[]).find(x=>x.id===s.streamId);$('sp-info').textContent=`${s.code} · ${s.gender} · ${cl}${st?' ('+st.name+')':''} · ${yr}`;$('sp-remove').style.display=s.photo?'':'none'}
function openProfile(id){PROFILE_ID=id;$('sp-msg').textContent='';paintProfile();$('stModal').style.display='flex'}
$('st-body').onclick=e=>{const r=e.target.closest('tr[data-id]');if(!r)return;e.preventDefault();openProfile(r.dataset.id)};
$('sp-close').onclick=()=>{$('stModal').style.display='none';PROFILE_ID=null};
$('stModal').onclick=e=>{if(e.target===$('stModal'))$('sp-close').onclick()};
$('sp-upload').onclick=()=>$('sp-file').click();
$('sp-file').onchange=async e=>{const f=e.target.files[0];e.target.value='';const s=profStudent();if(!f||!s)return;$('sp-msg').style.color='';$('sp-msg').textContent='Processing photo…';try{s.photo=await shrinkPhoto(f,240)}catch(err){$('sp-msg').textContent=err.message;return}paintProfile();loadStudents();const ok=await Promise.resolve(persist());$('sp-msg').style.color=ok===false?'#dc2626':'#059669';$('sp-msg').textContent=ok===false?'Photo shown but could not be saved — check your connection.':'Photo saved.'};
$('sp-remove').onclick=async()=>{const s=profStudent();if(!s)return;s.photo='';paintProfile();loadStudents();const ok=await Promise.resolve(persist());$('sp-msg').style.color=ok===false?'#dc2626':'#059669';$('sp-msg').textContent=ok===false?'Could not save — check your connection.':'Photo removed.'};
