const STORAGE_KEY='frontendSemana22StateV1';
const state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
let evidenceImages=[];
const $=(s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>[...c.querySelectorAll(s)];
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); updateProgress();}
function toast(el,msg){el.textContent=msg; setTimeout(()=>{if(el.textContent===msg)el.textContent='';},2200)}

const steps=[['identity','Identificação'],['rest','Aula 1 — REST'],['graphql','Aula 2 — GraphQL'],['auth','Aula 3 — OAuth/JWT'],['activity','Atividade prática'],['final','Quiz final']];
function complete(key){return !!(state.completed&&state.completed[key]);}
function markComplete(key,value=true){state.completed=state.completed||{};state.completed[key]=value;save();}
function updateProgress(){
  const done=steps.filter(([k])=>complete(k)).length; const pct=Math.round(done/steps.length*100);
  $('#progressPercent').textContent=pct+'%'; $('#progressRing').style.background=`conic-gradient(var(--red) ${pct*3.6}deg,#344054 0deg)`;
  $('#progressText').textContent=done===steps.length?'Trilha concluída. Revise e gere seu PDF.':`${done} de ${steps.length} etapas concluídas.`;
  $('#miniSteps').innerHTML=steps.map(([k,n])=>`<span class="${complete(k)?'done':''}">${complete(k)?'✓':'○'} ${n}</span>`).join('');
  $('#timeline').innerHTML=steps.map(([k,n],i)=>`<div class="step ${complete(k)?'done':''}"><strong>${complete(k)?'✓ ':''}${i+1}. ${n}</strong><small>${complete(k)?'Concluído':'Pendente'}</small></div>`).join('');
}

function initIdentity(){
  const ids={studentName:'name',studentClass:'className',studentNumber:'number',studentDate:'date'};
  Object.entries(ids).forEach(([id,k])=>{const el=$('#'+id); el.value=state.identity?.[k]||'';});
  if(!$('#studentDate').value) $('#studentDate').value=new Date().toISOString().slice(0,10);
  $('#saveIdentity').onclick=()=>{state.identity={name:$('#studentName').value.trim(),className:$('#studentClass').value.trim(),number:$('#studentNumber').value.trim(),date:$('#studentDate').value};if(state.identity.name&&state.identity.className){markComplete('identity');toast($('#identityStatus'),'✓ Identificação salva');}else toast($('#identityStatus'),'Preencha nome e turma.');save();refreshReview();};
}

const methodExamples={GET:{title:'GET — leitura de dados',text:'Usado para consultar/ler um recurso.',code:'GET /users/1\n→ retorna os dados do usuário 1'},POST:{title:'POST — criação',text:'Usado para criar um novo recurso.',code:'POST /users\nbody: { "nome": "Ana" }'},PUT:{title:'PUT — atualização',text:'Usado para atualizar um recurso.',code:'PUT /users/1\nbody: { "nome": "Ana Silva" }'},DELETE:{title:'DELETE — remoção',text:'Usado para remover um recurso.',code:'DELETE /users/1'}};
function initRest(){
  $$('#httpMethods button').forEach(b=>b.onclick=()=>{ $$('#httpMethods button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const d=methodExamples[b.dataset.method];$('#methodExplain').innerHTML=`<strong>${d.title}</strong><p>${d.text}</p><code>${d.code.replace(/\n/g,'<br>')}</code>`;});
  $('#simulateGet').onclick=async()=>{const c=$('#restConsole');c.textContent='GET /api/produtos\nEnviando requisição...';await delay(500);c.textContent+='\n200 OK\n'+JSON.stringify({id:1,nome:'Produto',preco:49.90},null,2);};
}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}
function initGraphQL(){
  function render(){const fields=$$('.gql-field:checked').map(x=>x.value);const body=fields.length?fields.join('\n    '):'# selecione um campo';$('#gqlQuery').textContent=`query {\n  usuario {\n    ${body}\n  }\n}`;const obj={};fields.forEach(f=>obj[f]=f==='nome'?'Marina':f==='email'?'marina@email.com':'(11) 99999-0000');$('#gqlResponse').textContent=JSON.stringify({data:{usuario:obj}},null,2);}
  $$('.gql-field').forEach(x=>x.onchange=render);render();
}
function initAuth(){
  $('#loginDemo').onclick=async()=>{const list=$('#loginSteps');list.innerHTML='';for(const s of ['Redirecionando para o provedor de login…','Usuário conclui a autenticação…','Token do provedor é recebido…','Token é enviado ao back-end…','Back-end valida e retorna um JWT…','Aplicação exibe o estado autenticado.']){const li=document.createElement('li');li.textContent=s;list.appendChild(li);await delay(550);}};
  $$('.state-buttons button').forEach(b=>b.onclick=()=>{const p=$('#statePreview'),st=b.dataset.state;p.className='state-preview '+st;if(st==='normal')p.innerHTML='<button>Entrar com Google</button><p>Pronto para autenticar.</p>';if(st==='loading')p.innerHTML='<button disabled>⏳ Aguarde...</button><p>Autenticando...</p>';if(st==='success')p.innerHTML='<button disabled>✓ Autenticado</button><p>Login realizado com sucesso.</p>';if(st==='error')p.innerHTML='<button>Entrar novamente</button><p>Erro na autenticação. Tente novamente.</p>';});
}

const quizzes={
rest:[
 {q:'Segundo o material, qual método HTTP é usado para leitura de dados?',o:['POST','GET','PUT','DELETE'],a:1,e:'GET é apresentado como o método usado para leitura.'},
 {q:'Qual alternativa descreve “stateless”?',o:['O servidor salva todos os estados do cliente','Cada requisição é independente','A API só aceita JSON','Toda API exige login'],a:1,e:'O material define stateless como requisições independentes, sem manter estado do cliente entre elas.'},
 {q:'Qual formato é citado como comum em respostas de APIs RESTful?',o:['PSD','JSON','DOCX','PPTX'],a:1,e:'JSON é citado como leve e fácil de trabalhar em diferentes linguagens.'},
 {q:'Por que a documentação é importante durante a integração?',o:['Para eliminar o código do sistema','Para facilitar o processo de integração','Para limitar todos os usuários','Para atualizar o sistema automaticamente'],a:1,e:'O material relaciona documentação com compreensão das regras e facilitação da integração.'},
 {q:'Uma vantagem destacada do uso de APIs é:',o:['Adicionar funcionalidades sem programar tudo do zero','Substituir totalmente o sistema','Garantir atualização automática de tudo','Ser uma ferramenta de design'],a:0,e:'A aula destaca o reaproveitamento de funcionalidades prontas por meio de APIs.'}
],
graphql:[
 {q:'Qual objetivo da Aula 2 aparece no material?',o:['Criar banco SQL','Utilizar GraphQL para consultas eficientes','Criar somente CSS','Substituir APIs por arquivos'],a:1,e:'O objetivo registrado é utilizar GraphQL para consultas eficientes.'},
 {q:'O que o material diz sobre uma consulta GraphQL?',o:['Sempre retorna todos os dados','Pode recuperar apenas os dados necessários','Só funciona sem servidor','Não usa tipos'],a:1,e:'A síntese da aula destaca consultas personalizadas recuperando apenas os dados necessários.'},
 {q:'O que pode fazer parte de um esquema GraphQL segundo a aula?',o:['Tipos, consultas e relacionamentos','Somente HTML','Planilhas e slides','Apenas autenticação'],a:0,e:'A aula menciona tipos, consultas e relacionamentos entre dados.'},
 {q:'Na prática apresentada, qual ambiente de servidor é citado?',o:['Node.js e Express','PHP e Apache apenas','Excel','Photoshop'],a:0,e:'O material cita uma API simples com GraphQL e servidor básico com Node.js e Express.'},
 {q:'Qual ideia resume GraphQL nesta aula?',o:['Consulta eficiente e personalizada','Excluir HTTP da web','Substituir o front-end','Criar imagens'],a:0,e:'A ênfase está em consultas eficientes e personalizadas.'}
],
auth:[
 {q:'Qual é o objetivo principal da Aula 3?',o:['Implementar autenticação com OAuth e JWT','Estudar somente CSS','Construir um banco relacional','Eliminar o back-end'],a:0,e:'O objetivo indicado no material é implementar autenticação com OAuth e JWT.'},
 {q:'Qual provedor é usado como exemplo de conta de terceiros?',o:['Google','Nenhum','FTP','Excel'],a:0,e:'A aula cita login seguro com contas de terceiros, como Google.'},
 {q:'Qual aspecto de UX é destacado na aula?',o:['Mensagens de erro e indicadores de carregamento','Somente cores escuras','Ausência de feedback','Ocultar erros'],a:0,e:'O material destaca feedback visual, mensagens de erro e indicadores de carregamento.'},
 {q:'O roteiro solicita que, em falha de autenticação, o usuário:',o:['Não receba informação','Receba mensagem de erro','Seja redirecionado sem aviso','Feche o navegador'],a:1,e:'A atividade pede explicitamente uma mensagem de erro visível.'},
 {q:'Enquanto o usuário aguarda resposta do Google ou servidor, o roteiro sugere:',o:['Spinner/indicador de carregamento','Excluir o botão','Recarregar a página sempre','Nenhum feedback'],a:0,e:'O roteiro pede um indicador de carregamento, como um spinner.'}
],
final:[
 {q:'GET é usado para:',o:['Leitura','Criação','Atualização','Remoção'],a:0,e:'Na Aula 1, GET corresponde à leitura de dados.'},
 {q:'POST é usado para:',o:['Ler','Criar','Remover','Somente autenticar'],a:1,e:'Na Aula 1, POST corresponde à criação.'},
 {q:'Em uma API RESTful, recursos são identificados por:',o:['URLs','Slides','Imagens','Planilhas'],a:0,e:'A aula menciona recursos identificados por URLs.'},
 {q:'JSON é citado porque:',o:['É formato comum e leve para dados','É editor gráfico','É banco obrigatório','Substitui HTTP'],a:0,e:'O material destaca JSON como leve e comum na troca de dados.'},
 {q:'GraphQL permite, segundo a aula:',o:['Consultas personalizadas com os dados necessários','Somente downloads','Excluir schemas','Impedir relacionamentos'],a:0,e:'A aula destaca consultas personalizadas e eficientes.'},
 {q:'Um esquema GraphQL pode incluir:',o:['Tipos, consultas e relacionamentos','Apenas CSS','Somente imagens','Nenhum tipo'],a:0,e:'Esses elementos aparecem na síntese da Aula 2.'},
 {q:'OAuth e JWT aparecem no material no contexto de:',o:['Autenticação segura','Formatação CSS','Banco local','Compressão de imagens'],a:0,e:'A Aula 3 trata de autenticação com OAuth e JWT.'},
 {q:'O login com Google é apresentado como:',o:['Exemplo de autenticação com conta de terceiros','Banco de dados','Método HTTP','Formato JSON'],a:0,e:'A aula usa Google como exemplo de provedor de autenticação.'},
 {q:'Para melhorar a usabilidade em autenticação, o material recomenda:',o:['Feedback de erro e carregamento','Ocultar todo estado','Nunca mostrar mensagens','Remover indicadores'],a:0,e:'A aula e o roteiro enfatizam feedback visual.'},
 {q:'Ao fim da atividade, os alunos devem:',o:['Escrever relatório e mostrar código/telas','Entregar só uma frase','Apagar o código','Fazer apenas o quiz'],a:0,e:'O roteiro solicita relatório, código e telas com as melhorias.'}
]};
function renderQuiz(key,target){const qs=quizzes[key];$(target).innerHTML=qs.map((x,i)=>`<div class="question" data-i="${i}"><p>${i+1}. ${x.q}</p>${x.o.map((o,j)=>`<label class="option"><input type="radio" name="${key}-${i}" value="${j}"> ${o}</label>`).join('')}<div class="feedback hidden"></div></div>`).join('');const saved=state.quizAnswers?.[key]||{};Object.entries(saved).forEach(([i,v])=>{const el=$(`input[name="${key}-${i}"][value="${v}"]`);if(el)el.checked=true;});}
function gradeQuiz(key){state.quizAnswers=state.quizAnswers||{};let score=0;quizzes[key].forEach((x,i)=>{const sel=$(`input[name="${key}-${i}"]:checked`);const q=$(`.quiz[data-quiz="${key}"] .question[data-i="${i}"]`);const f=$('.feedback',q);f.classList.remove('hidden','correct','wrong');if(sel){state.quizAnswers[key][i]=Number(sel.value);if(Number(sel.value)===x.a){score++;f.classList.add('correct');f.textContent='✓ Correto. '+x.e;}else{f.classList.add('wrong');f.textContent='✗ Revise. '+x.e;}}else{f.classList.add('wrong');f.textContent='Selecione uma alternativa.';}});state.scores=state.scores||{};state.scores[key]=score;$('#score-'+key).textContent=`${score}/${quizzes[key].length}`;const pct=Math.round(score/quizzes[key].length*100);$('#result-'+key).textContent=`Resultado: ${score}/${quizzes[key].length} (${pct}%).`;if(key==='rest')markComplete('rest');if(key==='graphql')markComplete('graphql');if(key==='auth')markComplete('auth');if(key==='final')markComplete('final');save();refreshReview();}
function resetQuiz(key){state.quizAnswers=state.quizAnswers||{};delete state.quizAnswers[key];state.scores=state.scores||{};delete state.scores[key];$$(`.quiz[data-quiz="${key}"] input`).forEach(x=>x.checked=false);$$(`.quiz[data-quiz="${key}"] .feedback`).forEach(x=>{x.className='feedback hidden';x.textContent='';});$('#score-'+key).textContent=`0/${quizzes[key].length}`;$('#result-'+key).textContent='';save();}
function initQuizzes(){renderQuiz('rest','#quiz-rest');renderQuiz('graphql','#quiz-graphql');renderQuiz('auth','#quiz-auth');renderQuiz('final','#quiz-final-box');$$('.submit-quiz').forEach(b=>b.onclick=()=>gradeQuiz(b.dataset.quiz));$$('.reset-quiz').forEach(b=>b.onclick=()=>resetQuiz(b.dataset.quiz));Object.keys(state.scores||{}).forEach(k=>{const el=$('#score-'+k);if(el)el.textContent=`${state.scores[k]}/${quizzes[k].length}`;});}

function initActivity(){
  $$('[data-save]').forEach(el=>{el.value=state.responses?.[el.dataset.save]||'';el.addEventListener('input',()=>{state.responses=state.responses||{};state.responses[el.dataset.save]=el.value;save();checkActivityComplete();});});
  $$('[data-save-check]').forEach(el=>{el.checked=!!state.checks?.[el.dataset.saveCheck];el.onchange=()=>{state.checks=state.checks||{};state.checks[el.dataset.saveCheck]=el.checked;save();checkActivityComplete();};});
  $('#copyCode').onclick=async()=>{const t=$('[data-save="improvementCode"]');try{await navigator.clipboard.writeText(t.value);}catch{};};
  $('#clearCode').onclick=()=>{if(confirm('Limpar o código preenchido?')){const t=$('[data-save="improvementCode"]');t.value='';state.responses=state.responses||{};state.responses.improvementCode='';save();}};
  $('#evidenceFiles').onchange=async e=>{evidenceImages=[];for(const f of [...e.target.files].slice(0,6)){if(!f.type.startsWith('image/'))continue;const data=await fileToDataURL(f);evidenceImages.push({name:f.name,data});}renderEvidence();refreshReview();};
  checkActivityComplete();
}
function fileToDataURL(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});}
function renderEvidence(){$('#evidencePreview').innerHTML=evidenceImages.map((x,i)=>`<figure><img src="${x.data}" alt="Evidência ${i+1}"><figcaption>${escapeHtml(x.name)}</figcaption></figure>`).join('');}
function checkActivityComplete(){const r=state.responses||{};const required=['answer1','answer2','answer3','answer4','improvementDescription','improvementCode','reportConclusion'];const ok=required.every(k=>(r[k]||'').trim().length>5);markComplete('activity',ok);}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function getMissing(){const m=[];if(!state.identity?.name)m.push('Nome do aluno');if(!state.identity?.className)m.push('Turma');const r=state.responses||{};[['answer1','Questão 1'],['answer2','Questão 2'],['answer3','Questão 3'],['answer4','Questão 4'],['improvementDescription','Descrição da melhoria'],['improvementCode','Código da melhoria'],['reportConclusion','Conclusão do relatório']].forEach(([k,n])=>{if(!(r[k]||'').trim())m.push(n)});if(state.scores?.final===undefined)m.push('Quiz final');return m;}
function refreshReview(){const i=state.identity||{},r=state.responses||{},s=state.scores||{};$('#reviewPanel').innerHTML=`<section><h3>Identificação</h3><p><strong>Nome:</strong> ${escapeHtml(i.name||'—')}<br><strong>Turma:</strong> ${escapeHtml(i.className||'—')}<br><strong>Nº:</strong> ${escapeHtml(i.number||'—')}<br><strong>Data:</strong> ${escapeHtml(i.date||'—')}</p></section><section><h3>Resultados</h3><p>REST: ${s.rest??'—'}/5<br>GraphQL: ${s.graphql??'—'}/5<br>OAuth/JWT: ${s.auth??'—'}/5<br>Quiz geral: ${s.final??'—'}/10</p></section><section><h3>Atividade</h3><p><strong>Q1:</strong> ${escapeHtml(r.answer1||'—')}</p><p><strong>Q2:</strong> ${escapeHtml(r.answer2||'—')}</p><p><strong>Q3:</strong> ${escapeHtml(r.answer3||'—')}</p><p><strong>Q4:</strong> ${escapeHtml(r.answer4||'—')}</p></section><section><h3>Melhoria</h3><p>${escapeHtml(r.improvementDescription||'—')}</p><pre>${escapeHtml(r.improvementCode||'// sem código')}</pre></section><section><h3>Conclusão do relatório</h3><p>${escapeHtml(r.reportConclusion||'—')}</p></section><section><h3>Evidências nesta sessão</h3><p>${evidenceImages.length} imagem(ns) selecionada(s).</p></section>`;}

function sanitizeName(s){return (s||'Aluno').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,'');}
function pdfText(doc,text,x,y,width=170){const lines=doc.splitTextToSize(text||'—',width);doc.text(lines,x,y);return y+lines.length*5.2;}
function ensurePage(doc,y,needed=25){if(y+needed>280){doc.addPage();return 20}return y;}
async function generatePDF(){const missing=getMissing();const box=$('#missingItems');if(missing.length){box.classList.remove('hidden');box.innerHTML='<strong>⚠ Existem etapas pendentes:</strong><ul>'+missing.map(x=>`<li>${escapeHtml(x)}</li>`).join('')+'</ul>';box.scrollIntoView({behavior:'smooth'});return;}box.classList.add('hidden');if(!window.jspdf?.jsPDF){alert('A biblioteca de PDF não carregou. Use “Imprimir / Salvar como PDF”.');return;}const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});const i=state.identity,r=state.responses||{},s=state.scores||{};let y=20;doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('Educação Profissional Paulista',20,y);y+=8;doc.setFontSize(13);doc.text('Técnico em Desenvolvimento de Sistemas — Programação Front-End',20,y);y+=7;doc.setFontSize(11);doc.text('Semana 22 — Integração com serviços externos e esteiras de entrega',20,y);y+=12;doc.setFont('helvetica','bold');doc.text('IDENTIFICAÇÃO',20,y);y+=7;doc.setFont('helvetica','normal');y=pdfText(doc,`Nome: ${i.name}\nTurma: ${i.className}   Nº: ${i.number||'—'}   Data: ${i.date||'—'}`,20,y);y+=7;doc.setFont('helvetica','bold');doc.text('RESULTADOS DOS QUIZZES',20,y);y+=7;doc.setFont('helvetica','normal');y=pdfText(doc,`Aula 1 — REST: ${s.rest??0}/5\nAula 2 — GraphQL: ${s.graphql??0}/5\nAula 3 — OAuth/JWT: ${s.auth??0}/5\nQuiz geral: ${s.final??0}/10`,20,y);const blocks=[['QUESTÃO 1',r.answer1],['QUESTÃO 2',r.answer2],['QUESTÃO 3',r.answer3],['QUESTÃO 4',r.answer4],['MELHORIA DE ERRO E FEEDBACK',r.improvementDescription],['CÓDIGO IMPLEMENTADO',r.improvementCode],['CONCLUSÃO / RELATÓRIO',r.reportConclusion]];for(const [title,txt] of blocks){y=ensurePage(doc,y,35);y+=7;doc.setFont('helvetica','bold');doc.text(title,20,y);y+=6;doc.setFont('helvetica','normal');doc.setFontSize(title==='CÓDIGO IMPLEMENTADO'?8.5:10.5);y=pdfText(doc,txt||'—',20,y,170);doc.setFontSize(10.5);}for(let idx=0;idx<evidenceImages.length;idx++){doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(`EVIDÊNCIA ${idx+1}: ${evidenceImages[idx].name}`,20,18);try{const img=evidenceImages[idx].data;const props=doc.getImageProperties(img);const maxW=170,maxH=245,ratio=Math.min(maxW/props.width,maxH/props.height);doc.addImage(img,props.fileType,20,26,props.width*ratio,props.height*ratio);}catch{doc.text('Não foi possível inserir esta imagem.',20,30);}}doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('ATIVIDADE CONCLUÍDA — SEMANA 22',20,25);doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('Relatório gerado pelo site educacional interativo de Programação Front-End.',20,34);doc.save(`FrontEnd_S22_${sanitizeName(i.name)}_${sanitizeName(i.className)}.pdf`);}

function initDelivery(){refreshReview();$('#refreshReview').onclick=refreshReview;$('#generatePdf').onclick=generatePDF;$('#printFallback').onclick=()=>{refreshReview();window.print();};$('#clearProgress').onclick=()=>{if(confirm('Deseja apagar todas as respostas e o progresso deste navegador?')){localStorage.removeItem(STORAGE_KEY);location.reload();}};}
function initMenu(){const nav=$('#mainNav');$('#menuToggle').onclick=()=>nav.classList.toggle('open');$$('#mainNav a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));}
function init(){initMenu();initIdentity();initRest();initGraphQL();initAuth();initQuizzes();initActivity();initDelivery();updateProgress();}
document.addEventListener('DOMContentLoaded',init);
