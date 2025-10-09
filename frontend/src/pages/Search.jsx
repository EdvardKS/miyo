import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search as SearchIcon, User, UserPlus, Loader2 } from 'lucide-react';

const fetchUsers = async (q) => {
  if (!q) return { users: [] };
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error buscando usuarios');
  return res.json();
};

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');

  const { data, isFetching } = useQuery(['searchUsers', query], () => fetchUsers(query), {
    keepPreviousData: true,
  });

  const users = data?.users || [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 flex items-center">
        <SearchIcon className="h-6 w-6 mr-2 text-primary-500" /> Buscar
      </h1>

      {/* Search inputs */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <div className="sm:col-span-2 flex">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios por nombre o bio"
            className="flex-1 h-10 px-3 border border-gray-300 dark:border-white/10 rounded-l-md bg-white dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <button
            onClick={() => setQuery(query.trim())}
            className="h-10 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-r-md"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim().toUpperCase();
            if (c) navigate(`/gallery/${c}`);
          }}
          className="flex"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código álbum"
            className="flex-1 h-10 px-3 border border-gray-300 dark:border-white/10 rounded-l-md uppercase bg-white dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <button className="h-10 px-3 bg-primary-500 hover:bg-primary-600 text-black rounded-r-md">Ir</button>
        </form>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-[#131313] border border-gray-200 dark:border-white/10 rounded-lg">
        {isFetching ? (
          <div className="py-10 flex items-center justify-center text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Buscando...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Sin resultados</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-white/10">
            {users.map((u) => (
              <li key={u._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover mr-3" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 mr-3 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-xs text-gray-500">{u.followersCount} seguidores</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    await fetch(`/api/users/${u.username}/follow`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }});
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" /> Seguir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;

