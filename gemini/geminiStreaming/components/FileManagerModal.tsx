import { useEffect, useState } from 'react';
import Modal from './Modal';

type Entry = { name: string; type: 'file' | 'directory'; size: number; mtimeMs: number };

type Props = { onClose: () => void };

export default function FileManagerModal({ onClose }: Props) {
  const [dir, setDir] = useState<string>('.')
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const list = async (d = dir) => {
    const res = await fetch('/api/fs/list', { method: 'POST', body: JSON.stringify({ dir: d }) })
    const data = await res.json()
    setDir(d)
    setEntries(data.entries || [])
  }

  const read = async (p: string) => {
    const res = await fetch('/api/fs/read', { method: 'POST', body: JSON.stringify({ path: p }) })
    const data = await res.json()
    setSelectedPath(p)
    setContent(data.content || '')
  }

  const write = async () => {
    if (!selectedPath) return
    setStatus('Saving...')
    await fetch('/api/fs/write', { method: 'POST', body: JSON.stringify({ path: selectedPath, content }) })
    setStatus('Saved')
    await list(dir)
  }

  const mkdir = async () => {
    const name = prompt('New folder name?')
    if (!name) return
    await fetch('/api/fs/mkdir', { method: 'POST', body: JSON.stringify({ path: (dir === '.' ? name : dir + '/' + name) }) })
    await list(dir)
  }

  const createFile = async () => {
    const name = prompt('New file name? (e.g., notes.txt)')
    if (!name) return
    const path = (dir === '.' ? name : dir + '/' + name)
    await fetch('/api/fs/write', { method: 'POST', body: JSON.stringify({ path, content: '' }) })
    await list(dir)
    await read(path)
  }

  const remove = async (p: string) => {
    if (!confirm(`Delete ${p}?`)) return
    await fetch('/api/fs/delete', { method: 'POST', body: JSON.stringify({ path: p }) })
    if (p === selectedPath) {
      setSelectedPath(''); setContent('')
    }
    await list(dir)
  }

  const enter = async (entry: Entry) => {
    if (entry.type === 'directory') {
      const next = dir === '.' ? entry.name : dir + '/' + entry.name
      await list(next)
    } else {
      const p = dir === '.' ? entry.name : dir + '/' + entry.name
      await read(p)
    }
  }

  const up = async () => {
    if (dir === '.') return
    const parts = dir.split('/'); parts.pop()
    const next = parts.join('/') || '.'
    await list(next)
  }

  useEffect(() => { list('.') }, [])

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', minWidth: 800 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <strong>user-files/{dir === '.' ? '' : dir + '/'}</strong>
            <button onClick={up} title="Up one level"><span className="icon">arrow_upward</span></button>
            <button onClick={mkdir}><span className="icon">create_new_folder</span> Folder</button>
            <button onClick={createFile}><span className="icon">note_add</span> File</button>
          </div>
          <div style={{ border: '1px solid #334155', borderRadius: 6, overflow: 'auto', maxHeight: 420 }}>
            <table className="file-table">
              <tbody>
                {entries.map(e => (
                  <tr key={e.name}>
                    <td>
                      <button onClick={() => enter(e)} style={{ width: '100%', textAlign: 'left' }}>
                        {e.type === 'directory' ? '📁' : '📄'} {e.name}
                      </button>
                    </td>
                    <td style={{ width: 80, textAlign: 'right' }}>{e.type === 'file' ? e.size : ''}</td>
                    <td style={{ width: 40 }}>
                      <button onClick={() => remove(dir === '.' ? e.name : dir + '/' + e.name)} title="Delete"><span className="icon">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <strong>{selectedPath ? `Editing: ${selectedPath}` : 'No file selected'}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{status}</span>
              <button onClick={write} disabled={!selectedPath}><span className="icon">save</span> Save</button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setStatus('') }}
            rows={22}
            style={{ width: '100%' }}
            placeholder="Select a file or create a new one..."
          />
        </div>
      </div>
    </Modal>
  )
}


