'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Todo } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const beep = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = 440;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.value = 0.05;
  o.start();
  o.stop(ctx.currentTime + 0.1);
  setTimeout(() => ctx.close(), 200);
};

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/todos`, { title: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/todos/${todo.id}`, null, {
        params: { completed: !todo.completed }
      });
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const saveEdit = async (todo: Todo) => {
    if (!editingText.trim()) return;
    try {
      await axios.put(`${API_BASE_URL}/api/todos/${todo.id}`, null, {
        params: { completed: todo.completed, title: editingText }
      });
      setTodos(todos.map(t => t.id === todo.id ? { ...t, title: editingText } : t));
      setEditingId(null);
      setEditingText('');
      beep();
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo(e as any);
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      setTodos(todos.map(t => ({ ...t, completed: true })));
      beep();
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setTodos(todos.filter(t => !t.completed));
      beep();
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="block w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue shadow-neon animate-neon-pulse flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#00ffff" strokeWidth="3" fill="#0a0a0a" />
              <text x="16" y="22" textAnchor="middle" fontSize="16" fill="#ff00ff" fontFamily="Orbitron, sans-serif">🕹️</text>
            </svg>
          </span>
          <h1 className="text-5xl font-extrabold text-neon-blue animate-neon-pulse drop-shadow-neon">Retro Neon Todo List</h1>
        </div>
      </div>
      <div className="flex flex-col items-center w-full">
        <div className="flex justify-center gap-4 mb-6 w-full flex-nowrap overflow-x-auto">
          <button onClick={() => setFilter('all')} className={`neon-button h-14 flex items-center justify-center ${filter === 'all' ? 'bg-neon-pink text-dark' : ''}`}>All</button>
          <button onClick={() => setFilter('active')} className={`neon-button h-14 flex items-center justify-center ${filter === 'active' ? 'bg-neon-pink text-dark' : ''}`}>Active</button>
          <button onClick={() => setFilter('completed')} className={`neon-button h-14 flex items-center justify-center ${filter === 'completed' ? 'bg-neon-pink text-dark' : ''}`}>Completed</button>
          <button onClick={() => { setTodos(todos.map(t => ({ ...t, completed: true }))); beep(); }} className="neon-button h-14 flex items-center justify-center">Mark All Complete</button>
          <button onClick={() => { setTodos(todos.filter(t => !t.completed)); beep(); }} className="neon-button h-14 flex items-center justify-center">Clear Completed</button>
        </div>
        <div className="neon-divider" />
        <form onSubmit={addTodo} className="mb-8 w-full" onKeyDown={handleKeyDown}>
          <div className="flex gap-4 w-full">
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="neon-input flex-grow"
            />
            <button type="submit" className="neon-button whitespace-nowrap w-36 text-lg">
              Add Todo
            </button>
          </div>
        </form>
        <div className="space-y-4 w-full">
          {filteredTodos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-6xl animate-neon-pulse">🌟</span>
              <span className="text-neon-blue text-xl mt-4 font-orbitron">No todos yet! Add one above.</span>
            </div>
          )}
          {filteredTodos.map((todo) => (
            <div key={todo.id} className="todo-item font-orbitron">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => { toggleTodo(todo); beep(); }}
                className="neon-checkbox"
              />
              {editingId === todo.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => saveEdit(todo)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo)}
                  className="neon-input flex-grow"
                />
              ) : (
                <span className={`flex-grow cursor-pointer ${todo.completed ? 'line-through text-gray-500' : ''}`}
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.title}
                </span>
              )}
              <button
                onClick={() => setShowConfirm(todo.id)}
                className="text-neon-pink hover:text-red-500 transition-colors"
              >
                Delete
              </button>
              {showConfirm === todo.id && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                  <div className="bg-dark p-8 rounded-lg border-2 border-neon-pink shadow-neon flex flex-col items-center">
                    <p className="text-neon-pink mb-4 font-orbitron">Are you sure you want to delete this todo?</p>
                    <div className="flex gap-4">
                      <button onClick={() => { deleteTodo(todo.id); setShowConfirm(null); beep(); }} className="neon-button">Yes</button>
                      <button onClick={() => setShowConfirm(null)} className="neon-button">No</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 