const $=id=>document.getElementById(id);
const KEY='ius_sons_local_schools_v1';
const SESSION='ius_sons_local_session_v1';
const load=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
const session=()=>localStorage.getItem(SESSION);
const setSession=id=>localStorage.setItem(SESSION,id);
const code=()=>{let n=load().length+1;return `1972-2004-${String(n).padStart(3,'0')}`};
function show(view){['register','login','success'].forEach(v=>$('view-'+v).style.display=v===view?'block':'none')}
const params=new URLSearchParams(location.search);show(params.get('view')==='register'?'register':'login');
$('toLogin').onclick=e=>{e.preventDefault();show('login')};
$('toRegister').onclick=e=>{e.preventDefault();show('register')};
$('registerBtn').onclick=()=>{
 const name=$('regSchool').value.trim(),email=$('regEmail').value.trim(),phone1=$('regPhone1').value.trim(),phone2=$('regPhone2').value.trim(),admin=$('regName').value.trim(),pass=$('regPassword').value,pass2=$('regPassword2').value;
 if(!name||!email||!phone1||!admin||!pass){$('registerMsg').textContent='Please fill in all required fields.';return}
 if(pass!==pass2){$('registerMsg').textContent='Passwords do not match.';return}
 let schools=load(); if(schools.some(s=>s.email.toLowerCase()===email.toLowerCase())){$('registerMsg').textContent='That email is already registered on this device.';return}
 const school={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),school_code:code(),name,email,phone1,phone2,admin,password:pass,status:'active',location:'',badge_url:'',years:[],classes:[],subjects:[],teachers:[],students:[],results:[]};schools.push(school);save(schools);setSession(school.id);$('schoolIdDisplay').textContent=school.school_code;show('success');
};
$('continueDashboard').onclick=()=>location.href='dashboard.html';
$('loginBtn').onclick=()=>{let c=$('loginCode').value.trim(),p=$('loginPassword').value,school=load().find(s=>s.school_code===c);if(!school){$('loginMsg').textContent='School ID not found on this device.';return}if(school.status==='suspended'){$('loginMsg').textContent='This school account is suspended.';return}if(school.password!==p){$('loginMsg').textContent='Incorrect password.';return}setSession(school.id);location.href='dashboard.html'};
