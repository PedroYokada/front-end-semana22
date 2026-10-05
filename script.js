const STORAGE_KEY = 'frontendSemana22StateV2';
const THEME_KEY = 'frontendSemana22Theme';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const state = loadState();
let evidenceImages = [];

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function save(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  updateProgress();
}
function delay(ms){ return new Promise(r => setTimeout(r, ms)); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function setStatus(message, type='info'){
  const el=$('#deliveryStatus'); if(!el) return;
  el.className=`status-message ${type}`; el.textContent=message; el.classList.remove('hidden');
}
function clearStatus(){ const el=$('#deliveryStatus'); if(el){ el.className='status-message hidden'; el.textContent=''; } }
function toast(el,msg){ if(!el) return; el.textContent=msg; setTimeout(()=>{if(el.textContent===msg)el.textContent='';},2600); }

const steps=[['identity','Identificação'],['rest','Aula 1 — REST'],['graphql','Aula 2 — GraphQL'],['auth','Aula 3 — OAuth/JWT'],['activity','Atividade prática'],['final','Quiz final']];
function complete(key){ return !!state.completed?.[key]; }
function markComplete(key,value=true){ state.completed=state.completed||{}; state.completed[key]=!!value; save(); }
function updateProgress(){
  const done=steps.filter(([k])=>complete(k)).length;
  const pct=Math.round(done/steps.length*100);
  if($('#progressPercent')) $('#progressPercent').textContent=pct+'%';
  if($('#progressRing')) $('#progressRing').style.background=`conic-gradient(var(--red) ${pct*3.6}deg,#344054 0deg)`;
  if($('#progressText')) $('#progressText').textContent=done===steps.length?'Trilha concluída. Revise e gere seu PDF.':`${done} de ${steps.length} etapas concluídas.`;
  if($('#miniSteps')) $('#miniSteps').innerHTML=steps.map(([k,n])=>`<span class="${complete(k)?'done':''}">${complete(k)?'✓':'○'} ${n}</span>`).join('');
  if($('#timeline')) $('#timeline').innerHTML=steps.map(([k,n],i)=>`<div class="step ${complete(k)?'done':''}"><strong>${complete(k)?'✓ ':''}${i+1}. ${n}</strong><small>${complete(k)?'Concluído':'Pendente'}</small></div>`).join('');
}

function initTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const prefersDark=window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const dark=saved ? saved==='dark' : prefersDark;
  document.body.classList.toggle('dark',dark);
  updateThemeButton();
  $('#themeToggle')?.addEventListener('click',()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY,document.body.classList.contains('dark')?'dark':'light');
    updateThemeButton();
  });
}
function updateThemeButton(){
  const b=$('#themeToggle'); if(!b) return;
  const dark=document.body.classList.contains('dark');
  b.innerHTML=dark?'☀️ <span>Modo claro</span>':'🌙 <span>Modo escuro</span>';
  b.setAttribute('aria-pressed',String(dark));
}

function initMenu(){
  const nav=$('#mainNav');
  $('#menuToggle')?.addEventListener('click',()=>nav?.classList.toggle('open'));
  $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
}

function initIdentity(){
  const map={studentName:'name',studentClass:'className',studentNumber:'number',studentDate:'date'};
  for(const [id,key] of Object.entries(map)){ const el=$('#'+id); if(el) el.value=state.identity?.[key]||''; }
  if($('#studentDate') && !$('#studentDate').value) $('#studentDate').value=new Date().toISOString().slice(0,10);
  $('#saveIdentity')?.addEventListener('click',()=>{
    state.identity={name:$('#studentName').value.trim(),className:$('#studentClass').value.trim(),number:$('#studentNumber').value.trim(),date:$('#studentDate').value};
    const ok=!!(state.identity.name&&state.identity.className);
    state.completed=state.completed||{}; state.completed.identity=ok; save();
    toast($('#identityStatus'),ok?'✓ Identificação salva':'⚠ Preencha nome e turma.');
    refreshReview();
  });
  ['studentName','studentClass','studentNumber','studentDate'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{
    state.identity=state.identity||{};
    state.identity[map[id]]=$('#'+id).value.trim();
    state.completed=state.completed||{}; state.completed.identity=!!(state.identity.name&&state.identity.className); save();
  }));
}

const methodExamples={GET:{title:'GET — leitura de dados',text:'Usado para consultar/ler um recurso.',code:'GET /users/1\n→ retorna os dados do usuário 1'},POST:{title:'POST — criação',text:'Usado para criar um novo recurso.',code:'POST /users\nbody: { "nome": "Ana" }'},PUT:{title:'PUT — atualização',text:'Usado para atualizar um recurso.',code:'PUT /users/1\nbody: { "nome": "Ana Silva" }'},DELETE:{title:'DELETE — remoção',text:'Usado para remover um recurso.',code:'DELETE /users/1'}};
function initRest(){
  $$('#httpMethods button').forEach(b=>b.addEventListener('click',()=>{
    $$('#httpMethods button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    const d=methodExamples[b.dataset.method]; if($('#methodExplain')) $('#methodExplain').innerHTML=`<strong>${d.title}</strong><p>${d.text}</p><code>${d.code.replace(/\n/g,'<br>')}</code>`;
  }));
  $('#simulateGet')?.addEventListener('click',async()=>{
    const c=$('#restConsole'); if(!c) return; c.textContent='GET /api/produtos\nEnviando requisição...'; await delay(450); c.textContent+='\n200 OK\n'+JSON.stringify({id:1,nome:'Produto',preco:49.90},null,2);
  });
}
function initGraphQL(){
  function render(){
    const fields=$$('.gql-field:checked').map(x=>x.value);
    const body=fields.length?fields.join('\n    '):'# selecione um campo';
    if($('#gqlQuery')) $('#gqlQuery').textContent=`query {\n  usuario {\n    ${body}\n  }\n}`;
    const obj={}; fields.forEach(f=>obj[f]=f==='nome'?'Marina':f==='email'?'marina@email.com':'(11) 99999-0000');
    if($('#gqlResponse')) $('#gqlResponse').textContent=JSON.stringify({data:{usuario:obj}},null,2);
  }
  $$('.gql-field').forEach(x=>x.addEventListener('change',render)); render();
}
function initAuth(){
  $('#loginDemo')?.addEventListener('click',async()=>{
    const list=$('#loginSteps'); if(!list) return; list.innerHTML='';
    for(const s of ['Redirecionando para o provedor de login…','Usuário conclui a autenticação…','Token do provedor é recebido…','Token é enviado ao back-end…','Back-end valida e retorna um JWT…','Aplicação exibe o estado autenticado.']){ const li=document.createElement('li'); li.textContent=s; list.appendChild(li); await delay(420); }
  });
  $$('.state-buttons button').forEach(b=>b.addEventListener('click',()=>{
    const p=$('#statePreview'),st=b.dataset.state; if(!p) return; p.className='state-preview '+st;
    const views={normal:'<button type="button">Entrar com Google</button><p>Pronto para autenticar.</p>',loading:'<button type="button" disabled>⏳ Aguarde...</button><p>Autenticando...</p>',success:'<button type="button" disabled>✓ Autenticado</button><p>Login realizado com sucesso.</p>',error:'<button type="button">Entrar novamente</button><p>Erro na autenticação. Tente novamente.</p>'}; p.innerHTML=views[st]||views.normal;
  }));
}

const quizzes={
rest:[
 {q:'Uma tela precisa buscar a lista de produtos sem criar ou alterar nada. Qual método é o mais adequado?',o:['POST','GET','PUT','DELETE'],a:1,e:'GET é o método apresentado no material para leitura de dados.'},
 {q:'Um estudante diz: “Depois da primeira requisição, o servidor REST precisa lembrar tudo sobre o cliente para entender a próxima”. Qual conceito mostra o problema dessa afirmação?',o:['JSON','Stateless','Endpoint','PUT'],a:1,e:'Em uma API RESTful stateless, cada requisição é independente.'},
 {q:'A URL /users/1 representa, no exemplo da aula:',o:['Um recurso específico identificado por URL','Um arquivo de CSS','Um método HTTP','Uma chave de API'],a:0,e:'O material usa /users/1 como exemplo de recurso identificado por URL.'},
 {q:'Você precisa integrar uma API desconhecida e quer descobrir endpoints, métodos e formato de uso. O que deve consultar primeiro?',o:['A documentação da API','O arquivo CSS','Um editor de imagens','Apenas o console do navegador'],a:0,e:'A aula destaca a documentação como fundamental para compreender regras e facilitar a integração.'},
 {q:'Por que usar uma API pronta pode economizar trabalho?',o:['Porque permite adicionar funcionalidades sem desenvolver tudo do zero','Porque elimina todo o código do sistema','Porque garante que nenhum erro aconteça','Porque substitui qualquer back-end'],a:0,e:'O material destaca a possibilidade de integrar funcionalidades prontas, como um serviço externo de SMS.'}
],
graphql:[
 {q:'Uma interface precisa apenas de nome e email, mas o serviço possui muitos outros campos. Qual ideia da Aula 2 combina melhor com esse caso?',o:['Solicitar apenas os dados necessários com GraphQL','Sempre baixar todos os dados','Eliminar o schema','Trocar JavaScript por CSS'],a:0,e:'A síntese da aula destaca consultas personalizadas recuperando apenas os dados necessários.'},
 {q:'No GraphQL, qual elemento descreve tipos, consultas e relacionamentos disponíveis?',o:['Schema','Spinner','JWT','Endpoint REST'],a:0,e:'O material cita a definição de um esquema GraphQL com tipos, consultas e relacionamentos.'},
 {q:'Qual alternativa descreve melhor uma query GraphQL?',o:['Uma consulta que declara os dados desejados','Um arquivo de estilo','Uma senha do servidor','Um método de exclusão de banco'],a:0,e:'GraphQL é apresentado no material como forma de realizar consultas personalizadas.'},
 {q:'Qual ambiente é citado na Aula 2 para uma API simples com GraphQL?',o:['Node.js e Express','Photoshop e Illustrator','Excel e Access','Somente HTML'],a:0,e:'A aula cita configuração de um servidor básico com Node.js e Express.'},
 {q:'REST e GraphQL devem ser entendidos como:',o:['Abordagens diferentes de integração e consulta','Tecnologias em que uma sempre substitui a outra','Ferramentas exclusivamente de design','Formatos de imagem'],a:0,e:'Nesta trilha, a comparação serve para entender estratégias diferentes, sem afirmar que uma é sempre superior.'}
],
auth:[
 {q:'Ao clicar em “Entrar com Google”, qual conceito da Aula 3 está sendo aplicado?',o:['Autenticação com OAuth','Apenas estilização CSS','Consulta GraphQL','Método DELETE'],a:0,e:'A Aula 3 trabalha autenticação com OAuth e JWT e usa Google como exemplo de conta de terceiros.'},
 {q:'Na atividade, o client_id deve ser analisado porque ele ajuda a:',o:['Identificar a aplicação no provedor OAuth','Guardar a senha do usuário','Definir o CSS da página','Substituir o JWT'],a:0,e:'A questão do roteiro pede justamente a finalidade e o uso do client_id no fluxo OAuth.'},
 {q:'Depois que o back-end valida o token do Google, o roteiro pede que o aluno explique o propósito de qual elemento?',o:['JWT','GET','Schema','Spinner'],a:0,e:'A quarta questão do roteiro trata do JWT gerado pelo back-end após a validação.'},
 {q:'Se o login está demorando e a tela não mostra nada, qual melhoria está alinhada ao material?',o:['Exibir um indicador de carregamento','Ocultar ainda mais informações','Recarregar a página continuamente','Remover o botão de login'],a:0,e:'O material pede explicitamente um indicador de carregamento, como spinner, durante a espera.'},
 {q:'Se a autenticação falhar, qual comportamento melhora a experiência do usuário?',o:['Mostrar uma mensagem de erro clara e permitir nova tentativa','Não informar nada','Exibir apenas uma exceção técnica','Fechar o navegador'],a:0,e:'O roteiro solicita mensagens de erro e feedback visual em caso de falha.'}
],
final:[
 {q:'Uma tela quer apenas consultar dados de produtos. Qual combinação está correta?',o:['GET + endpoint de produtos','POST + DELETE','JWT + CSS','GraphQL + imagem PNG'],a:0,e:'GET é apresentado para leitura e os recursos são identificados por URLs/endpoints.'},
 {q:'Qual conceito explica que cada requisição REST deve ser compreensível de forma independente?',o:['Stateless','Payload','Spinner','Schema'],a:0,e:'Stateless é uma das características apresentadas na Aula 1.'},
 {q:'Qual é o papel mais direto da documentação de uma API?',o:['Explicar como realizar a integração corretamente','Eliminar a necessidade de programar','Gerar automaticamente toda a interface','Armazenar tokens'],a:0,e:'A aula destaca a documentação para compreender regras e facilitar a integração.'},
 {q:'No GraphQL, o front-end pode declarar quais campos deseja receber por meio de uma:',o:['Query','Folha de estilo','Imagem','Senha'],a:0,e:'A Aula 2 destaca consultas personalizadas.'},
 {q:'O schema GraphQL é importante porque:',o:['Define tipos, consultas e relacionamentos','Exibe o spinner','É uma chave de API','Substitui todo servidor'],a:0,e:'Esses elementos aparecem na síntese da Aula 2.'},
 {q:'Qual situação combina com OAuth no conteúdo estudado?',o:['Login com uma conta de terceiro, como Google','Escolher cor de botão','Formatar JSON','Criar um endpoint DELETE'],a:0,e:'Google é usado como exemplo de autenticação com conta de terceiros.'},
 {q:'No fluxo estudado, o JWT aparece depois de:',o:['O back-end validar o token do Google','A página carregar o CSS','Uma query GraphQL falhar','O usuário fechar a página'],a:0,e:'A atividade pergunta pelo JWT gerado pelo back-end após a validação do token do Google.'},
 {q:'Um spinner durante autenticação serve principalmente para:',o:['Informar que a operação está em andamento','Aumentar a segurança criptográfica','Substituir o token','Criar um novo usuário'],a:0,e:'A Aula 3 destaca indicadores de carregamento como feedback visual.'},
 {q:'Qual mensagem é mais adequada para um usuário após uma falha de login?',o:['Não foi possível realizar o login. Tente novamente.','OAuth callback exception 500 stack trace','Nenhuma mensagem','Senha do servidor inválida: linha 83'],a:0,e:'A proposta de melhoria pede mensagens claras de erro ao usuário.'},
 {q:'Ao final da atividade prática, o roteiro solicita:',o:['Relatório com respostas, código e telas das melhorias','Somente um print do quiz','Apenas uma frase','Excluir o projeto'],a:0,e:'O documento solicita um relatório com respostas e evidências das melhorias implementadas.'}
]};

function renderQuiz(key,target){
  const qs=quizzes[key], container=$(target); if(!container) return;
  container.innerHTML=qs.map((x,i)=>`<div class="question" data-i="${i}"><p>${i+1}. ${escapeHtml(x.q)}</p>${x.o.map((o,j)=>`<label class="option"><input type="radio" name="${key}-${i}" value="${j}"> <span>${escapeHtml(o)}</span></label>`).join('')}<div class="feedback hidden" role="status"></div></div>`).join('');
  const saved=state.quizAnswers?.[key]||{};
  Object.entries(saved).forEach(([i,v])=>{ const el=$(`input[name="${key}-${i}"][value="${v}"]`); if(el) el.checked=true; });
  container.addEventListener('change',e=>{
    if(!e.target.matches('input[type="radio"]')) return;
    const [,index]=e.target.name.split('-').slice(-2);
    state.quizAnswers=state.quizAnswers||{}; state.quizAnswers[key]=state.quizAnswers[key]||{}; state.quizAnswers[key][Number(index)]=Number(e.target.value); save();
  });
}
function gradeQuiz(key){
  const items=quizzes[key];
  const unanswered=[];
  items.forEach((_,i)=>{ if(!$(`input[name="${key}-${i}"]:checked`)) unanswered.push(i); });
  const result=$('#result-'+key);
  $$(`.quiz[data-quiz="${key}"] .question`).forEach(q=>q.classList.remove('unanswered'));
  if(unanswered.length){
    unanswered.forEach(i=>$(`.quiz[data-quiz="${key}"] .question[data-i="${i}"]`)?.classList.add('unanswered'));
    if(result) result.textContent=`⚠ Responda todas as questões antes de corrigir. Faltam ${unanswered.length}.`;
    return;
  }
  state.quizAnswers=state.quizAnswers||{}; state.quizAnswers[key]=state.quizAnswers[key]||{};
  let score=0;
  items.forEach((x,i)=>{
    const sel=$(`input[name="${key}-${i}"]:checked`), chosen=Number(sel.value);
    state.quizAnswers[key][i]=chosen;
    const q=$(`.quiz[data-quiz="${key}"] .question[data-i="${i}"]`), f=$('.feedback',q);
    $$('.option',q).forEach((label,j)=>{ label.classList.remove('is-correct','is-wrong'); if(j===x.a) label.classList.add('is-correct'); if(j===chosen && j!==x.a) label.classList.add('is-wrong'); });
    f.classList.remove('hidden','correct','wrong');
    if(chosen===x.a){ score++; f.classList.add('correct'); f.textContent='✓ Resposta correta. '+x.e; }
    else { f.classList.add('wrong'); f.textContent='✕ Resposta incorreta. '+x.e; }
  });
  state.scores=state.scores||{}; state.scores[key]=score;
  state.completed=state.completed||{}; state.completed[key==='final'?'final':key]=true;
  save();
  const pct=Math.round(score/items.length*100);
  if($('#score-'+key)) $('#score-'+key).textContent=`${score}/${items.length}`;
  if(result) result.textContent=`Resultado: ${score}/${items.length} — Aproveitamento: ${pct}%.`;
  refreshReview();
}
function resetQuiz(key){
  state.quizAnswers=state.quizAnswers||{}; delete state.quizAnswers[key];
  state.scores=state.scores||{}; delete state.scores[key];
  state.completed=state.completed||{}; state.completed[key==='final'?'final':key]=false;
  $$(`.quiz[data-quiz="${key}"] input`).forEach(x=>x.checked=false);
  $$(`.quiz[data-quiz="${key}"] .option`).forEach(x=>x.classList.remove('is-correct','is-wrong'));
  $$(`.quiz[data-quiz="${key}"] .question`).forEach(x=>x.classList.remove('unanswered'));
  $$(`.quiz[data-quiz="${key}"] .feedback`).forEach(x=>{x.className='feedback hidden';x.textContent='';});
  if($('#score-'+key)) $('#score-'+key).textContent=`0/${quizzes[key].length}`;
  if($('#result-'+key)) $('#result-'+key).textContent=''; save(); refreshReview();
}
function initQuizzes(){
  renderQuiz('rest','#quiz-rest'); renderQuiz('graphql','#quiz-graphql'); renderQuiz('auth','#quiz-auth'); renderQuiz('final','#quiz-final-box');
  $$('.submit-quiz').forEach(b=>b.addEventListener('click',()=>gradeQuiz(b.dataset.quiz)));
  $$('.reset-quiz').forEach(b=>b.addEventListener('click',()=>resetQuiz(b.dataset.quiz)));
  Object.keys(state.scores||{}).forEach(k=>{ const el=$('#score-'+k); if(el) el.textContent=`${state.scores[k]}/${quizzes[k].length}`; });
}

function initActivity(){
  $$('[data-save]').forEach(el=>{
    el.value=state.responses?.[el.dataset.save]||'';
    el.addEventListener('input',()=>{ state.responses=state.responses||{}; state.responses[el.dataset.save]=el.value; save(); checkActivityComplete(); });
  });
  $$('[data-save-check]').forEach(el=>{
    el.checked=!!state.checks?.[el.dataset.saveCheck];
    el.addEventListener('change',()=>{ state.checks=state.checks||{}; state.checks[el.dataset.saveCheck]=el.checked; save(); checkActivityComplete(); });
  });
  $('#copyCode')?.addEventListener('click',async()=>{
    const t=$('[data-save="improvementCode"]'); if(!t) return;
    try{ await navigator.clipboard.writeText(t.value); setStatus('✓ Código copiado.','success'); }
    catch{ t.select(); document.execCommand('copy'); setStatus('✓ Código copiado.','success'); }
  });
  $('#clearCode')?.addEventListener('click',()=>{
    if(confirm('Limpar o código preenchido?')){ const t=$('[data-save="improvementCode"]'); if(t) t.value=''; state.responses=state.responses||{}; state.responses.improvementCode=''; save(); checkActivityComplete(); }
  });
  $('#evidenceFiles')?.addEventListener('change',async e=>{
    evidenceImages=[];
    for(const f of [...e.target.files].slice(0,6)){ if(!f.type.startsWith('image/')) continue; try{ evidenceImages.push({name:f.name,data:await fileToDataURL(f)}); }catch{} }
    renderEvidence(); refreshReview();
  });
  checkActivityComplete();
}
function fileToDataURL(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }
function renderEvidence(){ if($('#evidencePreview')) $('#evidencePreview').innerHTML=evidenceImages.map((x,i)=>`<figure><img src="${x.data}" alt="Evidência ${i+1}"><figcaption>${escapeHtml(x.name)}</figcaption></figure>`).join(''); }
function checkActivityComplete(){
  const r=state.responses||{};
  const required=['answer1','answer2','answer3','answer4','improvementDescription','improvementCode','reportConclusion'];
  const ok=required.every(k=>(r[k]||'').trim().length>0);
  state.completed=state.completed||{}; state.completed.activity=ok; save();
}

function getMissing(){
  const m=[];
  if(!state.identity?.name?.trim()) m.push('Nome do aluno');
  if(!state.identity?.className?.trim()) m.push('Turma');
  for(const [key,label] of [['rest','Quiz Aula 1 — REST'],['graphql','Quiz Aula 2 — GraphQL'],['auth','Quiz Aula 3 — OAuth/JWT'],['final','Quiz final']]) if(state.scores?.[key]===undefined) m.push(label);
  const r=state.responses||{};
  [['answer1','Questão 1'],['answer2','Questão 2'],['answer3','Questão 3'],['answer4','Questão 4'],['improvementDescription','Descrição da melhoria'],['improvementCode','Código da melhoria'],['reportConclusion','Conclusão do relatório']].forEach(([k,n])=>{ if(!(r[k]||'').trim()) m.push(n); });
  return m;
}
function refreshReview(){
  const i=state.identity||{},r=state.responses||{},s=state.scores||{};
  if(!$('#reviewPanel')) return;
  $('#reviewPanel').innerHTML=`<section><h3>Identificação</h3><p><strong>Nome:</strong> ${escapeHtml(i.name||'—')}<br><strong>Turma:</strong> ${escapeHtml(i.className||'—')}<br><strong>Nº:</strong> ${escapeHtml(i.number||'—')}<br><strong>Data:</strong> ${escapeHtml(i.date||'—')}</p></section><section><h3>Resultados</h3><p>REST: ${s.rest??'—'}/5<br>GraphQL: ${s.graphql??'—'}/5<br>OAuth/JWT: ${s.auth??'—'}/5<br>Quiz geral: ${s.final??'—'}/10</p></section><section><h3>Atividade</h3><p><strong>Q1:</strong> ${escapeHtml(r.answer1||'—')}</p><p><strong>Q2:</strong> ${escapeHtml(r.answer2||'—')}</p><p><strong>Q3:</strong> ${escapeHtml(r.answer3||'—')}</p><p><strong>Q4:</strong> ${escapeHtml(r.answer4||'—')}</p></section><section><h3>Melhoria</h3><p>${escapeHtml(r.improvementDescription||'—')}</p><pre>${escapeHtml(r.improvementCode||'// sem código')}</pre></section><section><h3>Conclusão do relatório</h3><p>${escapeHtml(r.reportConclusion||'—')}</p></section><section><h3>Evidências nesta sessão</h3><p>${evidenceImages.length} imagem(ns) selecionada(s). Evidências são opcionais.</p></section>`;
}
function sanitizeName(s){ return (s||'Aluno').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,''); }
function pdfText(doc,text,x,y,width=170){ const lines=doc.splitTextToSize(String(text||'—'),width); doc.text(lines,x,y); return y+lines.length*5.2; }
function ensurePage(doc,y,needed=25){ if(y+needed>280){ doc.addPage(); return 20; } return y; }
async function generatePDF(){
  clearStatus(); refreshReview();
  const missing=getMissing(), box=$('#missingItems');
  if(missing.length){
    if(box){ box.classList.remove('hidden'); box.innerHTML='<strong>⚠ Não foi possível finalizar. Faltam:</strong><ul>'+missing.map(x=>`<li>${escapeHtml(x)}</li>`).join('')+'</ul>'; box.scrollIntoView({behavior:'smooth',block:'center'}); }
    setStatus(`⚠ Existem ${missing.length} etapa(s) obrigatória(s) pendente(s).`,'warning'); return;
  }
  if(box){ box.classList.add('hidden'); box.innerHTML=''; }
  if(!window.jspdf?.jsPDF){ setStatus('✕ A biblioteca de PDF não pôde ser carregada. Use “Imprimir / Salvar como PDF”.','error'); return; }
  try{
    setStatus('Gerando PDF…','info');
    const {jsPDF}=window.jspdf, doc=new jsPDF({unit:'mm',format:'a4'}), i=state.identity||{},r=state.responses||{},s=state.scores||{}; let y=20;
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text('Educacao Profissional Paulista',20,y); y+=8;
    doc.setFontSize(13); doc.text('Tecnico em Desenvolvimento de Sistemas - Programacao Front-End',20,y); y+=7;
    doc.setFontSize(11); y=pdfText(doc,'Semana 22 - Integracao com servicos externos e esteiras de entrega',20,y); y+=8;
    doc.setFont('helvetica','bold'); doc.text('IDENTIFICACAO',20,y); y+=7; doc.setFont('helvetica','normal');
    y=pdfText(doc,`Nome: ${i.name}\nTurma: ${i.className}   No.: ${i.number||'-'}   Data: ${i.date||'-'}`,20,y); y+=7;
    doc.setFont('helvetica','bold'); doc.text('RESULTADOS DOS QUIZZES',20,y); y+=7; doc.setFont('helvetica','normal');
    y=pdfText(doc,`Aula 1 - REST: ${s.rest}/5\nAula 2 - GraphQL: ${s.graphql}/5\nAula 3 - OAuth/JWT: ${s.auth}/5\nQuiz geral: ${s.final}/10`,20,y);
    const blocks=[['QUESTAO 1',r.answer1],['QUESTAO 2',r.answer2],['QUESTAO 3',r.answer3],['QUESTAO 4',r.answer4],['MELHORIA DE ERRO E FEEDBACK',r.improvementDescription],['CODIGO IMPLEMENTADO',r.improvementCode],['CONCLUSAO / RELATORIO',r.reportConclusion]];
    for(const [title,txt] of blocks){ y=ensurePage(doc,y,35); y+=7; doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.text(title,20,y); y+=6; doc.setFont('helvetica','normal'); doc.setFontSize(title==='CODIGO IMPLEMENTADO'?8.3:10.5); y=pdfText(doc,txt,20,y,170); }
    for(let idx=0;idx<evidenceImages.length;idx++){
      doc.addPage(); doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text(`EVIDENCIA ${idx+1}: ${sanitizeName(evidenceImages[idx].name)}`,20,18);
      try{ const img=evidenceImages[idx].data, props=doc.getImageProperties(img), maxW=170,maxH=245,ratio=Math.min(maxW/props.width,maxH/props.height); doc.addImage(img,props.fileType,20,26,props.width*ratio,props.height*ratio); } catch {}
    }
    doc.addPage(); doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text('ATIVIDADE CONCLUIDA - SEMANA 22',20,25);
    doc.save(`FrontEnd_S22_${sanitizeName(i.name)}_${sanitizeName(i.className)}.pdf`);
    setStatus('✓ PDF gerado com sucesso. Verifique a pasta de downloads do navegador.','success');
  }catch(err){ console.error('Falha ao gerar PDF:',err); setStatus('✕ Ocorreu um erro ao gerar o PDF. Use “Imprimir / Salvar como PDF” como alternativa.','error'); }
}
function initDelivery(){
  refreshReview();
  $('#refreshReview')?.addEventListener('click',()=>{ refreshReview(); const m=getMissing(); setStatus(m.length?`Revisão atualizada. Ainda faltam ${m.length} item(ns).`:'✓ Revisão atualizada. A atividade está pronta para gerar o PDF.',m.length?'warning':'success'); });
  $('#generatePdf')?.addEventListener('click',generatePDF);
  $('#printFallback')?.addEventListener('click',()=>{ refreshReview(); window.print(); });
  $('#clearProgress')?.addEventListener('click',()=>{ if(confirm('Deseja apagar todas as respostas e o progresso deste navegador?')){ localStorage.removeItem(STORAGE_KEY); location.reload(); } });
}
function makeButtonsSafe(){ $$('button').forEach(b=>{ if(!b.hasAttribute('type')) b.type='button'; }); }
function init(){
  try{
    makeButtonsSafe(); initTheme(); initMenu(); initIdentity(); initRest(); initGraphQL(); initAuth(); initQuizzes(); initActivity(); initDelivery(); updateProgress();
  }catch(err){ console.error('Erro de inicialização:',err); setStatus('✕ O site encontrou um erro ao iniciar. Recarregue a página e verifique o console.','error'); }
}
document.addEventListener('DOMContentLoaded',init);
