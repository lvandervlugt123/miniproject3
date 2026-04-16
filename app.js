const API = 'https://pokeapi.co/api/v2';
const KANTO_LIMIT = 151;
const starters = ['bulbasaur','charmander','squirtle'];
const typeColors = {
  normal:'#A8A77A',fire:'#EE8130',water:'#6390F0',electric:'#F7D02C',grass:'#7AC74C',ice:'#96D9D6',fighting:'#C22E28',poison:'#A33EA1',ground:'#E2BF65',flying:'#A98FF3',psychic:'#F95587',bug:'#A6B91A',rock:'#B6A136',ghost:'#735797',dragon:'#6F35FC',dark:'#705746',steel:'#B7B7CE',fairy:'#D685AD'
};

const state = {all:[],cache:{},team:[]};

const $ = id=>document.getElementById(id);

function showGlobalLoading(show, text='Loading...'){
  const el=$('globalStatus');
  el.style.display = show? 'flex':'none';
  $('statusText').textContent = text;
}

async function fetchKanto(){
  showGlobalLoading(true,'Fetching Kanto list...');
  try{
    const res = await fetch(`${API}/pokemon?limit=${KANTO_LIMIT}`);
    if(!res.ok) throw new Error('Failed list');
    const data = await res.json();
    state.all = data.results; // {name,url}
    renderList(state.all);
  }catch(e){
    showError('Could not fetch Pokémon list.');
  }finally{showGlobalLoading(false)}
}

function showError(msg){
  const el=$('globalStatus'); el.style.display='flex'; $('statusText').textContent = msg;
}

async function fetchDetails(nameOrUrl){
  const key = typeof nameOrUrl === 'string' ? nameOrUrl : nameOrUrl.name;
  if(state.cache[key]) return state.cache[key];
  const url = typeof nameOrUrl === 'string' && nameOrUrl.startsWith('http') ? nameOrUrl : `${API}/pokemon/${key}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('fetch details failed');
  const data = await res.json();
  state.cache[data.name]=data;
  return data;
}

function createCard(p){
  const card = document.createElement('div'); card.className='card';
  const name = document.createElement('div'); name.textContent = p.name; name.style.textTransform='capitalize';
  const img = document.createElement('img'); img.alt = p.name; img.src=''; img.style.opacity=.9
  const tbox = document.createElement('div'); tbox.className='muted'; tbox.textContent='Loading...';
  card.appendChild(img); card.appendChild(name); card.appendChild(tbox);

  fetchDetails(p.url).then(d=>{
    img.src = d.sprites.front_default || '';
    if(!img.src) img.style.display='none';
    tbox.innerHTML = '';
    d.types.forEach(t=>{
      const span = document.createElement('span'); span.className='type'; span.textContent=t.type.name; span.style.background = typeColors[t.type.name]||'#999'; span.style.textTransform='capitalize';
      tbox.appendChild(span);
    });
  }).catch(()=>{ tbox.textContent='Details unavailable' });

  card.addEventListener('click',()=>openModal(p.name));
  card.addEventListener('dblclick',()=>toggleTeamMember(p.name));
  return card;
}

function renderList(list){
  const container = $('list'); container.innerHTML='';
  list.forEach(item=>{
    const c = createCard(item); container.appendChild(c);
  });
}

function renderStarters(){
  const el = $('starters'); el.innerHTML='';
  starters.forEach(name=>{
    const s = document.createElement('div'); s.className='starter panel'; s.dataset.name=name;
    const img = document.createElement('img'); img.alt=name; img.src='';
    const title = document.createElement('div'); title.textContent = name; title.style.textTransform='capitalize';
    const pick = document.createElement('button'); pick.className='btn'; pick.textContent='Choose';
    s.appendChild(img); s.appendChild(title); s.appendChild(pick);
    pick.addEventListener('click',()=>selectStarter(name,s));
    fetchDetails(name).then(d=>{ img.src=d.sprites.front_default }).catch(()=>{});
    el.appendChild(s);
  })
}

function selectStarter(name,el){
  // enforce single starter
  state.team = state.team.filter(member=>!starters.includes(member));
  state.team.unshift(name); // starter to first slot
  document.querySelectorAll('.starter').forEach(n=>n.classList.remove('selected'));
  el.classList.add('selected');
  updateTeamUI();
}

function updateTeamUI(){
  const slots = $('teamSlots'); slots.innerHTML='';
  for(let i=0;i<4;i++){
    const name = state.team[i] || null;
    const slot = document.createElement('div'); slot.className='slot';
    if(name){
      const img = document.createElement('img'); img.src=''; img.alt=name; slot.appendChild(img);
      fetchDetails(name).then(d=>{ img.src=d.sprites.front_default }).catch(()=>{});
      const nm = document.createElement('div'); nm.textContent=name; nm.style.textTransform='capitalize'; slot.appendChild(nm);
      const remove = document.createElement('button'); remove.className='btn'; remove.textContent='Remove'; remove.style.background='#ef4444'; remove.addEventListener('click',()=>{removeFromTeam(name)});
      slot.appendChild(remove);
    } else {
      slot.textContent = i===0? 'Starter slot' : 'Empty slot'; slot.classList.add('muted');
    }
    slots.appendChild(slot);
  }
}

function addToTeam(name){
  if(state.team.includes(name)) return;
  if(state.team.length===0){ showError('Please choose a starter first.'); setTimeout(()=>showGlobalLoading(false),1500); return; }
  if(state.team.length>=4){ showError('Team full. Remove a member first.'); setTimeout(()=>showGlobalLoading(false),1500); return; }
  state.team.push(name); updateTeamUI();
}

function removeFromTeam(name){ state.team = state.team.filter(n=>n!==name); updateTeamUI(); }

function toggleTeamMember(name){ if(state.team.includes(name)) removeFromTeam(name); else addToTeam(name); }

function openModal(name){
  const modal = $('modal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  const content = $('modalContent'); content.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading...</div></div>';
  fetchDetails(name).then(d=>{
    content.innerHTML = `
      <div style="display:flex;gap:18px;align-items:center">
        <img src="${d.sprites.front_default||''}" width="140" height="140" alt="${d.name}">
        <div>
          <h2 style="margin:0;text-transform:capitalize">${d.name}</h2>
          <div class="muted">#${d.id}</div>
          <div style="margin-top:8px">${d.types.map(t=>`<span class="type" style="background:${typeColors[t.type.name]}">${t.type.name}</span>`).join('')}</div>
          <p class="muted">Height: ${d.height} • Weight: ${d.weight}</p>
        </div>
      </div>
      <h4>Stats</h4>
      <div>${d.stats.map(s=>`<div class="muted">${s.stat.name}: ${s.base_stat}</div>`).join('')}</div>
      <div style="margin-top:8px"><button id="modalAdd" class="btn">Add to Team</button></div>
    `;
    $('modalAdd').addEventListener('click',()=>{ addToTeam(d.name); });
  }).catch(()=>{ content.innerHTML = '<div class="muted">Failed to load details.</div>' });
}

function closeModal(){ const modal=$('modal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

function setup(){
  $('closeModal').addEventListener('click',closeModal);
  $('modal').addEventListener('click',e=>{ if(e.target.id==='modal') closeModal(); });
  $('searchInput').addEventListener('input',e=>{
    const q = e.target.value.toLowerCase().trim();
    renderList(state.all.filter(p=>p.name.includes(q)));
  });
  $('resetBtn').addEventListener('click',()=>{ state.team=[]; updateTeamUI(); document.querySelectorAll('.starter').forEach(n=>n.classList.remove('selected')); });
  $('saveTeam').addEventListener('click',()=>{ localStorage.setItem('poketeam',JSON.stringify(state.team)); alert('Team saved to localStorage'); });
  $('loadTeam').addEventListener('click',()=>{ const t=JSON.parse(localStorage.getItem('poketeam')||'[]'); if(t.length){ state.team=t; updateTeamUI(); alert('Team loaded'); } else alert('No saved team'); });
  renderStarters(); updateTeamUI(); fetchKanto();
}

window.addEventListener('DOMContentLoaded',setup);
