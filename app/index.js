let todos = [];
let expandedId = null;
const STORAGE_KEY = 'todos_list';

function formatDate(d){
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) +
         ' · ' + date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}

function loadTodos(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  }catch(e){
    todos = [];
  }
  render();
}

function saveTodos(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }catch(e){
    console.error('Could not save todos', e);
  }
}

function addTodo(text){
  if(!text.trim()) return;
  todos.unshift({
    id: Date.now().toString(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString()
  });
  saveTodos();
  render();
}

function toggleDone(id){
  const t = todos.find(t => t.id === id);
  if(t) t.done = !t.done;
  saveTodos();
  render();
}

function deleteTodo(id){
  todos = todos.filter(t => t.id !== id);
  if(expandedId === id) expandedId = null;
  saveTodos();
  render();
}

function toggleExpand(id){
  expandedId = (expandedId === id) ? null : id;
  render();
}

function render(){
  const list = document.getElementById('list');
  const counter = document.getElementById('counter');
  list.innerHTML = '';

  if(todos.length === 0){
    list.innerHTML = '<div class="empty">No tasks yet — add one above.</div>';
    counter.textContent = '';
    return;
  }

  todos.forEach(t => {
    const item = document.createElement('div');
    item.className = 'item' + (t.done ? ' done' : '') + (expandedId === t.id ? ' expanded' : '');
    item.innerHTML = `
      <div class="item-top">
        <div class="check-dot">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div style="flex:1">
          <div class="item-text">${escapeHtml(t.text)}</div>
          <div class="item-date">${formatDate(t.createdAt)}</div>
        </div>
      </div>
      <div class="actions">
        <button class="${t.done ? 'btn-undone' : 'btn-done'}" data-action="toggle">${t.done ? 'Mark as undone' : 'Mark as done'}</button>
        <button class="btn-delete" data-action="delete">Delete</button>
      </div>
    `;
    item.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      if(action === 'toggle'){
        e.stopPropagation();
        toggleDone(t.id);
      } else if(action === 'delete'){
        e.stopPropagation();
        deleteTodo(t.id);
      } else {
        toggleExpand(t.id);
      }
    });
    list.appendChild(item);
  });

  const doneCount = todos.filter(t => t.done).length;
  counter.textContent = `${doneCount} of ${todos.length} done`;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('newTodoInput');
  addTodo(input.value);
  input.value = '';
  input.focus();
});

document.getElementById('newTodoInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    const input = e.target;
    addTodo(input.value);
    input.value = '';
  }
});

loadTodos();