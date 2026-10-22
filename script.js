const form = document.querySelector('#todo-form');
const input = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskSummary = document.querySelector('#task-summary');
const completedSummary = document.querySelector('#completed-summary');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter');
const STORAGE_KEY = 'simple-todo-list-tasks';
let tasks = loadTasks();
let currentFilter = 'all';
function loadTasks(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(saved)?saved:[]}catch{return []}}
function saveTasks(){localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks))}
function addTask(text){const cleanText=text.trim();if(!cleanText)return;tasks.unshift({id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,text:cleanText,completed:false});saveTasks();renderTasks()}
function toggleTask(id){tasks=tasks.map(task=>task.id===id?{...task,completed:!task.completed}:task);saveTasks();renderTasks()}
function deleteTask(id){tasks=tasks.filter(task=>task.id!==id);saveTasks();renderTasks()}
function getVisibleTasks(){if(currentFilter==='active')return tasks.filter(task=>!task.completed);if(currentFilter==='completed')return tasks.filter(task=>task.completed);return tasks}
function renderTasks(){taskList.replaceChildren();const visibleTasks=getVisibleTasks();const remaining=tasks.filter(task=>!task.completed).length;const completed=tasks.length-remaining;taskSummary.textContent=`${remaining} task${remaining===1?'':'s'} left`;completedSummary.textContent=`${completed} completed`;emptyState.hidden=visibleTasks.length>0;if(!visibleTasks.length){const messages={all:'No tasks yet. Add one to get started!',active:'You have no active tasks. Nice work!',completed:'No completed tasks yet.'};emptyState.querySelector('p').textContent=messages[currentFilter]}
visibleTasks.forEach(task=>{const item=document.createElement('li');item.className=`task-item${task.completed?' completed':''}`;const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='task-check';checkbox.checked=task.completed;checkbox.setAttribute('aria-label',`Mark ${task.text} as ${task.completed?'active':'completed'}`);checkbox.addEventListener('change',()=>toggleTask(task.id));const text=document.createElement('span');text.className='task-text';text.textContent=task.text;const remove=document.createElement('button');remove.type='button';remove.className='delete-button';remove.textContent='×';remove.setAttribute('aria-label',`Delete ${task.text}`);remove.addEventListener('click',()=>deleteTask(task.id));item.append(checkbox,text,remove);taskList.append(item)})}
form.addEventListener('submit',event=>{event.preventDefault();addTask(input.value);input.value='';input.focus()});
filterButtons.forEach(button=>button.addEventListener('click',()=>{currentFilter=button.dataset.filter;filterButtons.forEach(filter=>{const active=filter===button;filter.classList.toggle('active',active);filter.setAttribute('aria-pressed',String(active))});renderTasks()}));
clearCompletedButton.addEventListener('click',()=>{tasks=tasks.filter(task=>!task.completed);saveTasks();renderTasks()});
renderTasks();
