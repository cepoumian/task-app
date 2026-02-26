'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: number
  title: string
  completed: boolean
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.API_URL || 'http://localhost:4000'

  // Cargar tareas al iniciar
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/tasks`)
      if (!response.ok) throw new Error('Error al cargar tareas')
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError('No se pudo conectar con la API. ¿Está corriendo el backend?')
      console.error(err)
      // Usar datos mock si la API no está disponible
      setTasks([
        { id: 1, title: 'Ejemplo de tarea 1', completed: false },
        { id: 2, title: 'Ejemplo de tarea 2', completed: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      })
      
      if (response.ok) {
        const task = await response.json()
        setTasks([...tasks, task])
        setNewTask('')
      }
    } catch (err) {
      console.error('Error al añadir tarea:', err)
      // Modo offline: añadir localmente
      const newTaskObj = { id: Date.now(), title: newTask, completed: false }
      setTasks([...tasks, newTaskObj])
      setNewTask('')
    }
  }

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      })
    } catch (err) {
      console.error('Error al actualizar tarea:', err)
    }

    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Error al eliminar tarea:', err)
    }

    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Gestor de Tareas</h1>
        <p style={styles.subtitle}>
          Dockerizado profesionalmente 🐳
        </p>

        {error && (
          <div style={styles.warning}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={addTask} style={styles.form}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nueva tarea..."
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Añadir
          </button>
        </form>

        {isLoading ? (
          <p style={styles.loading}>Cargando tareas...</p>
        ) : (
          <div style={styles.taskList}>
            {tasks.length === 0 ? (
              <p style={styles.empty}>No hay tareas. ¡Añade una!</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={styles.task}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={styles.checkbox}
                  />
                  <span style={{
                    ...styles.taskText,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1,
                  }}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={styles.deleteButton}
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <div style={styles.stats}>
          Total: {tasks.length} | 
          Completadas: {tasks.filter(t => t.completed).length} | 
          Pendientes: {tasks.filter(t => !t.completed).length}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#333',
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '14px',
    marginBottom: '30px',
  },
  warning: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: '#856404',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  taskList: {
    marginBottom: '20px',
  },
  task: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  taskText: {
    flex: 1,
    fontSize: '16px',
    color: '#333',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#666',
    padding: '20px',
  },
  empty: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px 20px',
  },
  stats: {
    textAlign: 'center' as const,
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
  },
}
