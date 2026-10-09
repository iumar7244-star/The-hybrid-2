const SUBJECTS={
  senior12:["English Language","Mathematics","Biology","Chemistry","Physics","Geography","History & Political Education","Entrepreneurship Education","Physical Education (PE)","General Science","Kiswahili"],
  senior34:["English Language","Mathematics","Biology","Chemistry","Physics","Geography","History & Political Education"],
  primary:["English","Mathematics","Integrated Science","Social Studies"],
  tp:["القرآن","التربية الإسلامية","الفقه","اللغة العربية"],
  tj:["الحفظ والتفسير","التلاوة والتجويد","الإملاء والخط","الأدب والنصوص","إنشاء والمطالعة","النحو والصرف","فقه العبادات","الحديث","العقيدة","التاريخ"],
  ts:["الحفظ والتفسير","التلاوة والتجويد","الإملاء والخط","الأدب والنصوص","إنشاء والمطالعة","النحو والصرف","فقه العبادات","الحديث","العقيدة","التاريخ","مصطلح الحديث","أصول الفقه","أصول التفسير","فقه المعاملات","الأديان والفرق"]
};
const ELECTIVES={
  senior12:{options:["Arabic Language","Luganda","Art","Religious Education","Other / Custom Subject"],max:1},
  senior34:{options:["Arabic Language","Luganda","Kiswahili","Art","Entrepreneurship Education","Religious Education","Other / Custom Subject"],max:2}
};
const ENF=["Inter","Roboto","Segoe UI","Lato","Open Sans","Poppins","Nunito","Calibri","Times New Roman","Georgia","Montserrat","Arial"],ARF=["Noto Sans Arabic","Cairo","Tajawal","Almarai","Readex Pro","Amiri","Traditional Arabic","Sakkal Majalla","Changa","Kufam","Scheherazade New","Harmattan"];
const CATEGORY_NAMES={senior12:"Senior 1 & 2 (O-Level)",senior34:"Senior 3 & 4 (O-Level)",primary:"Primary School",tp:"التعليم الديني الابتدائي",tj:"أول إعدادي - ثالث إعدادي",ts:"أول ثانوي - ثالث ثانوي"};
const $=id=>document.getElementById(id);
ENF.forEach(x=>$('fontEn').add(new Option(x,x)));ARF.forEach(x=>$('fontAr').add(new Option(x,x)));
$('fontEn').value='Arial';$('fontAr').value='Noto Sans Arabic';
let students=[],badge='';
const uid=()=>Math.random().toString(36).slice(2);
const loadSchools=()=>JSON.parse(localStorage.getItem('ius_sons_local_schools_v1')||'[]');
const sessionId=()=>localStorage.getItem('ius_sons_local_session_v1');
let SCHOOL=loadSchools().find(s=>s.id===sessionId())||null;
function persistSchool(){if(!SCHOOL)return;const all=loadSchools(),i=all.findIndex(s=>s.id===SCHOOL.id);if(i>=0){all[i]=SCHOOL;localStorage.setItem('ius_sons_local_schools_v1',JSON.stringify(all));}}
function esc(x){return String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
const theology=()=>['tp','tj','ts'].includes($('category').value);
const isPrimary=()=>['primary','tp'].includes($('category').value);
const isSecondary=()=>['senior12','senior34'].includes($('category').value);
function pg(m){if(m>=80)return['D1','1'];if(m>=70)return['D2','2'];if(m>=60)return['C3','3'];if(m>=50)return['C4','4'];if(m>=40)return['C5','5'];if(m>=30)return['C6','6'];if(m>=20)return['P7','7'];if(m>=10)return['P8','8'];return['F9','9']}
function tg(m){if(m>=80)return['ممتاز',''];if(m>=70)return['جيد جدا',''];if(m>=60)return['جيد',''];if(m>=50)return['حسن',''];if(m>=40)return['مقبول',''];return['راسب','']}
function olGrade(m){if(m>=80)return['A','Pass with Distinction'];if(m>=70)return['B','Pass with Credit'];if(m>=60)return['C','Pass with Credit'];if(m>=50)return['D','Pass'];return['E','Pass with lower competency']}
function grade(m){return m===''?['—','']:theology()?tg(+m):isSecondary()?olGrade(+m):pg(+m)}
function toArabicDigits(v){return String(v??'').replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])}
function total(s){return s.marks.reduce((a,b)=>a+(+b||0),0)}
function overall(a){return a>=80?'ممتاز':a>=70?'جيد جدا':a>=60?'جيد':a>=50?'حسن':a>=40?'مقبول':'راسب'}
function inferCategory(name){const n=String(name||'').toLowerCase();if(/senior\s*[12]|s[12]\b|s\.\s*[12]/.test(n))return'senior12';if(/senior\s*[34]|s[34]\b|s\.\s*[34]/.test(n))return'senior34';if(/primary|p[1-7]\b|p\.\s*[1-7]/.test(n))return'primary';if(/junior|j[1-3]\b/.test(n))return'tj';if(/theology.*primary|religious.*primary/.test(n))return'tp';if(/theology.*secondary|religious.*secondary/.test(n))return'ts';return'primary'}
function getSelectedClass(){return SCHOOL?.classes?.find(c=>c.id===$('className').value)||null}
function getSchoolSubjects(classId){
  if(!SCHOOL?.subjects?.length)return[];
  const assigned=SCHOOL.subjects.filter(s=>Array.isArray(s.classes)&&s.classes.length===0||Array.isArray(s.classes)&&s.classes.includes(classId));
  return assigned.map(s=>s.name).filter(Boolean);
}
function currentSubjects(cat=$('category').value){const cls=getSelectedClass();const schoolSubs=cls?getSchoolSubjects(cls.id):[];return schoolSubs.length?schoolSubs:SUBJECTS[cat]||[]}
function makeReportData(cat,subjectList=currentSubjects(cat)){return{marks:subjectList.map(()=>''),customNames:{},subjects:[...subjectList]}}
function ensureSubjects(s,cat){const subs=currentSubjects(cat);if(!Array.isArray(s.subjects)||s.subjects.length!==subs.length||s.subjects.some((x,i)=>x!==subs[i])){const old=Object.fromEntries((s.subjects||[]).map((x,i)=>[x,s.marks?.[i]??'']));s.marks=subs.map(x=>old[x]??'');s.subjects=[...subs];}return s}
function ensureCombined(s){if(!s.combined)s.combined={primary:makeReportData('primary'),tp:makeReportData('tp')};if(!s.combined.primary)s.combined.primary=makeReportData('primary');if(!s.combined.tp)s.combined.tp=makeReportData('tp');return s.combined}
function addStudent(){const cat=$('category').value;const subs=currentSubjects(cat);students.push({id:uid(),name:'',marks:subs.map(()=>''),subjects:[...subs],customNames:{},combined:{primary:makeReportData('primary'),tp:makeReportData('tp')}});render()}
function combinedMode(){return $('perPage').value==='combined'&&$('category').value==='primary'}
function reportEditor(data,key,title){
  const sub=data.subjects||SUBJECTS[key]||[];
  const rows=data.marks.map((m,i)=>{const g=key==='primary'?pg(+m||0):tg(+m||0);return `<div class="subject" data-i="${i}"><input class="subname" readonly value="${esc(sub[i]||'Subject')}"><input class="combined-mark" type="number" min="0" max="100" step="1" inputmode="numeric" data-report="${key}" value="${m}" placeholder="0–100"><div class="grade" dir="auto">${m===''?'—':g[0]}</div></div>`}).join('');
  return `<div class="combined-report-editor" data-report-key="${key}"><div class="combined-title"><b>${title}</b><span class="combined-total">Total: ${total(data)} / ${data.marks.length*100} | Percentage: ${data.marks.length?(total(data)/data.marks.length).toFixed(2):0}%</span><button type="button" class="gray combined-restore" data-report="${key}">Restore</button><button type="button" class="gray combined-clear" data-report="${key}">Clear</button></div>${rows}</div>`;
}
function renderSingle(){
  const cat=$('category').value,sub=currentSubjects(cat),secondary=isSecondary(),cLen=SUBJECTS[cat]?.length||0;
  students.forEach(s=>ensureSubjects(s,cat));
  $('students').innerHTML=students.map((s,n)=>{
    const subjectRows=s.marks.map((m,i)=>{const g=grade(m),isCompulsory=secondary&&i<cLen;return `<div class="subject" data-i="${i}"><input class="subname" ${isCompulsory?'readonly':''} value="${esc(s.customNames?.[i]??s.subjects?.[i]??sub[i]??'Subject')}"><input class="mark" type="number" min="0" max="100" step="1" inputmode="numeric" value="${m}" placeholder="0–100"><div class="grade" dir="auto">${g[0]}</div>${isCompulsory?'':'<button class="danger del">Remove</button>'}</div>`}).join('');
    let electivePicker='';
    if(secondary&&!SCHOOL){const pool=ELECTIVES[cat],used=Math.max(0,s.marks.length-cLen),remaining=pool.max-used;const opts=pool.options.filter(o=>!(s.subjects||[]).includes(o));if(remaining>0)electivePicker=`<div class="electiveRow"><select class="electivePick">${opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select><button class="green addElective">+ Add Elective (${remaining} left)</button></div>`}
    return `<div class="student" data-id="${s.id}"><div class="student-head"><b>${n+1}.</b><input class="name" value="${esc(s.name)}" placeholder="Student full name"><button class="green addsub">+ Add Subject</button><button class="gray restore">Restore Defaults</button><button class="gray clear">Clear Table</button><button class="danger remove">Remove Student</button></div>${subjectRows}${electivePicker}<b class="totalLine">Total: ${total(s)} / ${s.marks.length*100} | Percentage: ${s.marks.length?(total(s)/s.marks.length).toFixed(2):0}%</b></div>`;
  }).join('');
  document.querySelectorAll('.student').forEach(c=>{
    const s=students.find(x=>x.id===c.dataset.id);c.querySelector('.name').oninput=e=>{s.name=e.target.value;build()};c.querySelector('.remove').onclick=()=>{students=students.filter(x=>x!==s);render()};
    c.querySelector('.clear').onclick=()=>{s.marks=s.marks.map(()=> '');render()};c.querySelector('.restore').onclick=()=>{const subs=currentSubjects($('category').value);s.subjects=[...subs];s.marks=subs.map(()=> '');s.customNames={};render()};
    c.querySelector('.addsub').onclick=()=>{s.subjects=s.subjects||currentSubjects($('category').value);s.subjects.push('New Subject');s.marks.push('');render()};
    c.querySelectorAll('.subname').forEach((e,i)=>e.oninput=()=>{s.customNames=s.customNames||{};s.customNames[i]=e.value;build()});
    c.querySelectorAll('.mark').forEach((e,i)=>e.oninput=()=>{let v=e.value.replace(/\D/g,'');s.marks[i]=v===''?'':Math.min(100,parseInt(v,10));if(s.marks[i]!==''&&+e.value>100)e.value=100;c.querySelectorAll('.subject')[i].querySelector('.grade').textContent=grade(s.marks[i])[0];c.querySelector('.totalLine').textContent=`Total: ${total(s)} / ${s.marks.length*100} | Percentage: ${s.marks.length?(total(s)/s.marks.length).toFixed(2):0}%`;build()});
    c.querySelectorAll('.del').forEach(btn=>btn.onclick=()=>{const i=+btn.closest('.subject').dataset.i;s.marks.splice(i,1);s.subjects.splice(i,1);render()});
    const ae=c.querySelector('.addElective');if(ae)ae.onclick=()=>{const choice=c.querySelector('.electivePick').value;s.subjects.push(choice);s.marks.push('');render()};
  });
}
function renderCombined(){
  $('students').innerHTML=students.map((s,n)=>{const data=ensureCombined(s);return `<div class="student combined-student" data-id="${s.id}"><div class="student-head"><b>${n+1}.</b><input class="name" value="${esc(s.name)}" placeholder="Student full name"><button class="danger remove">Remove Student</button></div><p class="combined-hint">One student, two separate reports. Enter marks independently for each report. The student's name appears only on the first report when printed.</p>${reportEditor(data.primary,'primary','Primary School Report')}${reportEditor(data.tp,'tp','Theology Primary Report')}</div>`}).join('');
  document.querySelectorAll('.combined-student').forEach(c=>{const s=students.find(x=>x.id===c.dataset.id),data=ensureCombined(s);c.querySelector('.name').oninput=e=>{s.name=e.target.value;build()};c.querySelector('.remove').onclick=()=>{students=students.filter(x=>x!==s);render()};
    c.querySelectorAll('.combined-mark').forEach(e=>e.oninput=()=>{const key=e.dataset.report,i=+e.closest('.subject').dataset.i,v=e.value.replace(/\D/g,'');data[key].marks[i]=v===''?'':Math.min(100,parseInt(v,10));const box=e.closest('.combined-report-editor'),d=data[key];box.querySelector('.combined-total').textContent=`Total: ${total(d)} / ${d.marks.length*100} | Percentage: ${d.marks.length?(total(d)/d.marks.length).toFixed(2):0}%`;e.closest('.subject').querySelector('.grade').textContent=v===''?'—':(key==='primary'?pg(+v)[0]:tg(+v)[0]);build()});
    c.querySelectorAll('.combined-clear').forEach(btn=>btn.onclick=()=>{data[btn.dataset.report].marks=data[btn.dataset.report].marks.map(()=> '');render()});c.querySelectorAll('.combined-restore').forEach(btn=>btn.onclick=()=>{data[btn.dataset.report]=makeReportData(btn.dataset.report);render()});
  });
}
function render(){if(combinedMode())renderCombined();else renderSingle();renderPreview();build()}
function renderPreview(){const old=$('preview').value;$('preview').innerHTML=students.map((s,i)=>`<option value="${s.id}">${i+1}. ${esc(s.name||'Unnamed')}</option>`).join('');if(students.some(s=>s.id===old))$('preview').value=old}
function rank(s){const a=students.map(x=>combinedMode()?total(ensureCombined(x).primary):total(x)).sort((a,b)=>b-a);const score=combinedMode()?total(ensureCombined(s).primary):total(s);return a.indexOf(score)+1}
function card(s,two,keyOverride,dataOverride,showName=true){
  const key=keyOverride||$('category').value,isO=key==='senior12'||key==='senior34',isAr=['tp','tj','ts'].includes(key),data=dataOverride||s,t=total(data),avg=data.marks.length?t/data.marks.length:0,sub=data.subjects||currentSubjects(key);
  const rows=data.marks.map((m,i)=>{const g=isO?olGrade(+m||0):(key==='primary'?pg(+m||0):tg(+m||0));return `<tr><td>${esc(data.customNames?.[i]??sub[i]??'Subject')}</td><td>${isAr?toArabicDigits(+m||0):(+m||0)}</td><td dir="auto">${m===''?'—':g[0]}</td>${isAr?'':`<td>${g[1]}</td>`}</tr>`}).join('');
  const entered=data.marks.filter(m=>m!==''&&m!=null&&!isNaN(+m));
  const cmt=!entered.length?'':entered.some(m=>+m<50)?(isAr?'يمكنك تحسين مستواك إذا بذلتَ مزيدًا من الجهد والعمل الجاد.':'Your performance can improve if you work harder.'):(isAr?'تقدُّم ممتاز، واصل العمل الجاد وحافظ على هذا المستوى.':'Excellent progress. Continue working hard.');
  const commentHtml=cmt?`<div class="comment"><b>${isAr?'تعليق معلم الصف':'Class teacher comment'}:</b> ${cmt}</div>`:'';
  const photoImg=showName&&s.photo&&/^data:image\//.test(s.photo)?`<img class="student-photo" src="${s.photo}" alt="">`:'';
  const nameLine=showName?`<b>${isAr?'اسم الطالب':'Student'}:</b> ${esc(s.name||'—')}<br>`:'';
  const title=key==='primary'?'Primary School Report':key==='tp'?'Theology Primary Report':CATEGORY_NAMES[key]||'School Report';
  return `<div class="report-sheet ${$('color').value}${two?' two':''} ${isAr?'rtl':''} ${$('border').value==='none'?'':'border-'+$('border').value}" style="font-family:'${isAr?$('fontAr').value:$('fontEn').value}';color:${$('fontColor').value}"><div class="report-head${(key==='primary'||key==='tp')?' badge-top':''}">${badge?`<img class="report-badge" src="${badge}">`:''}<div><div class="school-title">${esc($('school').value||'SCHOOL NAME')}</div><div class="location">${esc($('location').value||'')}</div><div class="report-type">${esc(title)}</div></div></div><div class="meta">${photoImg}${nameLine}<b>${isAr?'الصف':'Class'}:</b> ${esc(getClassLabel())}<br><b>${isAr?'المركز / الترتيب':'Position / Rank'}:</b> ${rank(s)} / ${students.length}</div><table class="table" style="font-family:'${isAr?$('fontAr').value:$('fontEn').value}';color:${$('fontColor').value}"><tr><th>${isAr?'المادة':'Subject'}</th><th>${isAr?'العلامة / ١٠٠':'Mark /100'}</th><th>${isAr?'التقدير':'Grade'}</th>${isAr?'':'<th>Code / Level</th>'}</tr>${rows}</table><div class="summary">${isAr?'المجموع':'Total'}: ${isAr?toArabicDigits(t):t} / ${isAr?toArabicDigits(data.marks.length*100):data.marks.length*100}<br>${isAr?'النسبة المئوية':'Percentage'}: ${isAr?toArabicDigits(avg.toFixed(2)):avg.toFixed(2)}%${isO?`<br>Overall Grade: ${olGrade(avg)[0]} — ${olGrade(avg)[1]}`:(key==='ts'?`<br>Overall Grade: ${overall(avg)}`:'')}</div>${commentHtml}<div class="footer"><span>Teacher: __________</span><span>Head Teacher: __________</span></div></div>`;
}
function getClassLabel(){const c=getSelectedClass();return c?c.name:($('className').value||'—')}
function build(){if(!students.length){$('report').innerHTML='';return}let out='';if(combinedMode()){students.forEach(s=>{const d=ensureCombined(s);out+=card(s,true,'primary',d.primary,true);out+=card(s,true,'tp',d.tp,false)})}else students.forEach(s=>out+=card(s,false));$('report').innerHTML=out}
function help(){const k=$('category').value;if(k==='senior12')$('gradingHelp').innerHTML=`O-Level grading: A 80–100 · B 70–79 · C 60–69 · D 50–59 · E 0–49. Senior 1 & 2 rules: 11 compulsory subjects + exactly 1 elective when using the built-in curriculum.`;else if(k==='senior34')$('gradingHelp').innerHTML=`O-Level grading: A 80–100 · B 70–79 · C 60–69 · D 50–59 · E 0–49. Senior 3 & 4 rules: 7 core subjects + up to 2 electives when using the built-in curriculum.`;else if(theology())$('gradingHelp').innerHTML=`Theology grading: 80–100 ممتاز · 70–79 جيد جدا · 60–69 جيد · 50–59 حسن · 40–49 مقبول · below 40 راسب.`;else $('gradingHelp').innerHTML=`Primary grading: D1 80–100 · D2 70–79 · C3 60–69 · C4 50–59 · C5 40–49 · C6 30–39 · P7 20–29 · P8 10–19 · F9 below 10.`}
function populateSchool(){if(!SCHOOL)return;$('school').value=SCHOOL.name||'IUS AND SONS';$('location').value=SCHOOL.location||'';if(SCHOOL.badge_url&&/^data:image\//.test(SCHOOL.badge_url)){badge=SCHOOL.badge_url;$('badgePreview').src=badge;$('badgePreview').style.display='block'}const classes=SCHOOL.classes||[];$('className').innerHTML=classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')||'<option value="">No classes created yet</option>';const years=SCHOOL.years||[];$('reportYear').innerHTML=years.map(y=>`<option value="${y.id}">${y.year}</option>`).join('')||'<option value="">No academic years</option>';if(classes.length){const c=classes[0];$('className').value=c.id;$('category').value=c.category||inferCategory(c.name)}help();}
function loadSchoolStudents(){if(!SCHOOL){$('studentsMsg').textContent='No school is signed in. Add students manually below.';if(!students.length)addStudent();return}const classId=$('className').value;const yearId=$('reportYear').value;const cat=$('category').value;const subs=currentSubjects(cat);const list=(SCHOOL.students||[]).filter(s=>s.classId===classId&&(!yearId||s.yearId===yearId));students=list.map(st=>{const marks=subs.map(subject=>{const subjectRec=(SCHOOL.subjects||[]).find(x=>x.name===subject);const r=(SCHOOL.results||[]).find(r=>r.studentId===st.id&&r.subjectId===subjectRec?.id&&r.yearId===yearId&&r.term===$('reportTerm').value&&r.assessment===$('reportAssessment').value);return r?.mark??''});return{id:st.id,name:st.name,photo:st.photo||'',marks,subjects:[...subs],customNames:{},schoolStudentId:st.id,combined:{primary:makeReportData('primary'),tp:makeReportData('tp')}}});$('studentsMsg').textContent=list.length?`${list.length} student(s) loaded from ${SCHOOL.name}.`:'No students found for this class/year. Add students from the School Dashboard.';render()}
function saveReportResults(){if(!SCHOOL){$('studentsMsg').textContent='No school account is signed in; changes are only for this report preview.';return}const classId=$('className').value,yearId=$('reportYear').value,term=$('reportTerm').value,assessment=$('reportAssessment').value;const subs=currentSubjects($('category').value);students.forEach(st=>{if(!st.schoolStudentId)return;st.marks.forEach((mark,i)=>{const subjectName=st.subjects?.[i]||subs[i];const sr=(SCHOOL.subjects||[]).find(x=>x.name===subjectName);if(!sr)return;SCHOOL.results=SCHOOL.results.filter(r=>!(r.studentId===st.schoolStudentId&&r.subjectId===sr.id&&r.yearId===yearId&&r.term===term&&r.assessment===assessment));if(mark!=='')SCHOOL.results.push({id:uid(),studentId:st.schoolStudentId,yearId,term,assessment,subjectId:sr.id,mark:+mark})})});persistSchool();$('studentsMsg').textContent='Report marks saved to the school records on this device.'}
$('loadStudents').onclick=loadSchoolStudents;$('add').onclick=addStudent;$('category').onchange=()=>{if(SCHOOL)loadSchoolStudents();else{students=students.map(s=>{const subs=currentSubjects($('category').value);return {...s,marks:subs.map((_,i)=>s.marks[i]||''),subjects:[...subs],customNames:{}}});help();render()}};$('preview').onchange=build;
['school','location','color','fontEn','fontAr','fontColor','border'].forEach(x=>$(x).oninput=build);$('perPage').onchange=render;
$('badge').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{badge=r.result;$('badgePreview').src=badge;$('badgePreview').style.display='block';build()};r.readAsDataURL(f)};
$('print').onclick=()=>print();$('word').onclick=()=>{const b=new Blob([`<html><body>${$('report').innerHTML}</body></html>`],{type:'application/msword'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='IUS-and-SONS-Reports.doc';a.click()};
if(SCHOOL){$('className').onchange=()=>{$('category').value=getSelectedClass()?.category||inferCategory(getSelectedClass()?.name);help();loadSchoolStudents()};$('reportYear').onchange=loadSchoolStudents;$('reportTerm').onchange=loadSchoolStudents;$('reportAssessment').onchange=loadSchoolStudents;populateSchool();loadSchoolStudents();}else{$('className').innerHTML='<option value="manual">Senior 1</option>';$('className').value='manual';help();addStudent()}
$('saveResults').onclick=saveReportResults;
