'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../service/api';
import { validateSQLQuery } from '../../types/validators';
import type { StudentInstance, QueryResult } from '../../types';

export default function StudentQueriesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [instances, setInstances] = useState<StudentInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState('');
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      loadInstances();
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const instanceIdFromUrl = searchParams.get('instanceId');
    if (instanceIdFromUrl) {
      setSelectedInstanceId(instanceIdFromUrl);
    }
  }, [searchParams]);

  const loadInstances = async () => {
    setIsLoadingInstances(true);
    try {
      const data = await apiService.getStudentInstances();
      setInstances(data);
      if (data.length === 1) {
        setSelectedInstanceId(data[0].instanceId ?? (data as any)[0].id ?? '');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al cargar instancias');
    } finally {
      setIsLoadingInstances(false);
    }
  };

  const activeInstance = instances.find(i => (i.instanceId ?? (i as any).id ?? '') === selectedInstanceId);
  const engineLabel = (() => {
    const engine = activeInstance?.engineType;
    if (engine === 1) return 'MySQL';
    if (engine === 2) return 'PostgreSQL';
    if (engine === 3) return 'MongoDB';
    if (engine === 4) return 'Redis';
    if (engine === 5) return 'SQL Server';
    return activeInstance?.databaseName ?? 'SQL';
  })();
  const hasInstanceParam = Boolean(searchParams.get('instanceId'));
  const hideInstanceSelect = hasInstanceParam || instances.length === 1;

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (queryError) setQueryError('');
    if (serverError) setServerError('');
  };

  const handleExecuteQuery = async () => {
    setServerError('');
    setQueryError('');
    setResult(null);

    if (!selectedInstanceId) {
      setServerError('Debes seleccionar una instancia');
      return;
    }

    const validationError = validateSQLQuery(query);
    if (validationError) {
      setQueryError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const queryResult = await apiService.executeQuery({
        instanceId: selectedInstanceId,
        query: query.trim(),
      });
      setResult(queryResult);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al ejecutar query');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = (() => {
    const engine = activeInstance?.engineType;
    if (engine === 2) {
      // PostgreSQL
      return [
        { label: 'SELECT basico', query: 'SELECT * FROM public.usuarios LIMIT 10;' },
        { label: 'Listar tablas', query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" },
        { label: 'Describir tabla', query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios';" },
        { label: 'Contar registros', query: 'SELECT COUNT(*) FROM public.usuarios;' },
      ];
    }
    if (engine === 5) {
      // SQL Server
      return [
        { label: 'SELECT basico', query: 'SELECT TOP 10 * FROM dbo.usuarios;' },
        { label: 'Listar tablas', query: "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';" },
        { label: 'Describir tabla', query: "sp_help 'dbo.usuarios';" },
        { label: 'Contar registros', query: 'SELECT COUNT(*) FROM dbo.usuarios;' },
      ];
    }
    if (engine === 3) {
      // MongoDB
      return [
        { label: 'Listar colecciones', query: '{ listCollections: 1 }' },
        { label: 'Primeros docs', query: '{ find: "usuarios", limit: 10 }' },
        { label: 'Contar docs', query: '{ count: "usuarios" }' },
        { label: 'Describe esquema', query: '{ find: "usuarios", limit: 1 }' },
      ];
    }
    if (engine === 4) {
      // Redis (ejemplos simples)
      const prefix = activeInstance?.databaseName ?? 'tu_prefijo';
      return [
        { label: 'Ping', query: 'PING' },
        { label: 'Set clave demo', query: `SET ${prefix}:usuarios:99 demo` },
        { label: 'Get clave demo', query: `GET ${prefix}:usuarios:1` },
        { label: 'Listar keys', query: `KEYS ${prefix}:usuarios:*` },
      ];
    }
    // Default MySQL
    return [
      { label: 'SELECT basico', query: 'SELECT * FROM usuarios LIMIT 10;' },
      { label: 'Mostrar tablas', query: 'SHOW TABLES;' },
      { label: 'Describir tabla', query: 'DESCRIBE usuarios;' },
      { label: 'Contar registros', query: 'SELECT COUNT(*) FROM usuarios;' },
    ];
  })();

  if (authLoading || isLoadingInstances) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            MultiDB Academy
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.name}</span>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-white mb-2">Ejecutar Queries {engineLabel}</h1>
          <p className="text-gray-400">Practica y ejecuta consultas en tu instancia {engineLabel}</p>
        </div>

        {instances.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-semibold mb-2">No tienes instancias asignadas</p>
            <p className="text-gray-500 text-sm mb-6">Contacta a tu profesor para que te asigne una instancia de base de datos</p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Volver al Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de Control */}
            <div className="lg:col-span-1 animate-fade-in-left">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuracion
                </h3>

                {/* Seleccionar Instancia */}
                {(!hideInstanceSelect) && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instancia de BD</label>
                    <select
                      value={selectedInstanceId}
                      onChange={(e) => setSelectedInstanceId(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all"
                    >
                      <option value="">-- Selecciona --</option>
                      {instances.map((instance, idx) => {
                        const key = instance.instanceId ?? (instance as any).id ?? idx;
                        const value = instance.instanceId ?? (instance as any).id ?? '';
                        const label = instance.instanceName ?? (instance as any).name ?? (instance as any).databaseName ?? `Instancia ${idx + 1}`;
                        return (
                          <option key={key} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Info de la instancia */}
                {selectedInstanceId && (
                  <div className="bg-gradient-to-br from-purple-900 to-blue-900 bg-opacity-30 border border-purple-500 border-opacity-50 rounded-lg p-4 mb-6">
                    <p className="text-xs text-purple-300 font-medium mb-1">INSTANCIA ACTIVA</p>
                    <p className="text-sm font-bold text-white">
                      {activeInstance?.instanceName ?? (activeInstance as any)?.name ?? (activeInstance as any)?.databaseName ?? selectedInstanceId}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">DB: {engineLabel}</p>
                  </div>
                )}

                {/* Ejemplos */}
                <div>
                  <h4 className="font-semibold text-sm text-white mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Queries de Ejemplo
                  </h4>
                  <div className="space-y-2">
                    {exampleQueries.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(example.query)}
                        className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all text-sm border border-gray-700 hover:border-cyan-500"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Editor y Resultados */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in-right">
              {/* Editor */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Editor {engineLabel}
                </h3>

                <textarea
                  value={query}
                  onChange={handleQueryChange}
                  placeholder={`Escribe tu consulta para ${engineLabel}...`}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all font-mono text-sm resize-none"
                  rows={10}
                  disabled={!selectedInstanceId}
                />

                {queryError && (
                  <p className="text-red-400 text-sm mt-2 animate-shake flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {queryError}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleExecuteQuery}
                    disabled={isLoading || !selectedInstanceId || !query.trim()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ejecutando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ejecutar Query
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setQuery(''); setResult(null); setQueryError(''); setServerError(''); }}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-700 hover:border-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Error del Servidor */}
              {serverError && (
                <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg animate-fade-in flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm mt-1">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Resultados */}
              {result && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Resultados
                    </h3>
                    {result.executionTime && (
                      <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">⏱ {result.executionTime}ms</span>
                    )}
                  </div>

                  {result.success ? (
                    <div>
                      <div className="bg-green-900 bg-opacity-30 border border-green-500 border-opacity-50 text-green-300 px-4 py-3 rounded-lg mb-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-semibold">Query ejecutado exitosamente</p>
                            {result.rowsAffected !== undefined && (
                              <p className="text-sm mt-1">Filas afectadas: {result.rowsAffected}</p>
                            )}
                            {result.message && <p className="text-sm mt-1">{result.message}</p>}
                          </div>
                        </div>
                      </div>

                      {result.data && result.data.length > 0 ? (
                        <div>
                          <div className="overflow-x-auto rounded-lg border border-gray-800">
                            <table className="min-w-full divide-y divide-gray-800">
                              <thead className="bg-gray-800">
                                <tr>
                                  {result.columns?.map((column, index) => (
                                    <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                      {column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-black divide-y divide-gray-800">
                                {result.data.map((row, rowIndex) => (
                                  <tr key={rowIndex} className="hover:bg-gray-900 transition-colors">
                                    {result.columns?.map((column, colIndex) => (
                                      <td key={colIndex} className="px-4 py-3 text-sm text-gray-300">
                                        {String((row as Record<string, unknown>)[column] ?? 'NULL')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                            <span>Total de registros: {result.data.length}</span>
                            <span className="bg-gray-800 px-3 py-1 rounded-full">{result.columns?.length || 0} columnas</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500">La consulta no devolvio resultados</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 text-red-300 px-4 py-3 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-semibold">Error en la consulta:</p>
                          <p className="text-sm mt-1 font-mono bg-black bg-opacity-50 p-2 rounded mt-2">{result.error || result.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
