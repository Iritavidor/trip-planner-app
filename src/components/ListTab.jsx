import React, { useState } from 'react';
import { useTrip } from '../context/TripContext.jsx';

export default function ListTab({ listKey, title }) {
  const { state, dispatch } = useTrip();
  const [text, setText] = useState('');
  const items = state[listKey] || [];

  const add = () => {
    if (!text.trim()) return;
    dispatch({ type: 'ADD_LIST_ITEM', list: listKey, text: text.trim() });
    setText('');
  };

  return (
    <div className="card space-y-2">
      <h2 className="font-bold text-brand-red">{title}</h2>
      <div className="flex gap-2">
        <input className="field flex-1" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} placeholder="פריט חדש" />
        <button className="btn-primary" onClick={add}>הוסף</button>
      </div>
      <ul className="space-y-1">
        {items.map(i => (
          <li key={i.id} className="flex items-center gap-2 py-1">
            <input type="checkbox" checked={i.checked} onChange={() => dispatch({ type: 'TOGGLE_LIST_ITEM', list: listKey, id: i.id })} />
            <span className={`flex-1 ${i.checked ? 'line-through opacity-60' : ''}`}>{i.text}</span>
            <button className="text-brand-red text-sm" onClick={() => dispatch({ type: 'DELETE_LIST_ITEM', list: listKey, id: i.id })}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
