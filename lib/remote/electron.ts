/**
 * Electron vs browser detection and shared file-save logic (DRY).
 */
import type { SaveTextFileOptions } from '@/types'

export type { SaveTextFileOptions }

export function isElectron(): boolean {
  return typeof window !== 'undefined' && Boolean(window.electronAPI)
}

/**
 * Save text content to a file. Uses Electron save dialog + write when available,
 * otherwise triggers browser download.
 */
export async function saveTextFile(
  content: string,
  defaultName: string,
  options: SaveTextFileOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const {
    title = 'Save file',
    mimeType = 'text/plain',
    filters = [{ name: 'All', extensions: ['*'] }],
  } = options

  if (isElectron() && window.electronAPI) {
    const { filePath } = await window.electronAPI.saveFileDialog({
      title,
      defaultPath: defaultName,
      filters,
    })
    if (!filePath) return { success: false }
    const result = await window.electronAPI.writeFile(filePath, content)
    return { success: result.success, error: result.error }
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = defaultName
  a.click()
  URL.revokeObjectURL(url)
  return { success: true }
}
