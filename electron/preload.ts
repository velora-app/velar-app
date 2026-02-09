import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../types'

const electronAPI: ElectronAPI = {
  executeQuery: (connection, query) => ipcRenderer.invoke('execute-query', { connection, query }),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', { filePath, data }),
  exportExcel: (data, defaultPath) => ipcRenderer.invoke('export-excel', { data, defaultPath }),
  fetchSchema: (connection) => ipcRenderer.invoke('fetch-schema', { connection }),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
