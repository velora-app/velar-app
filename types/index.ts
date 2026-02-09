/**
 * Type layer: single entry point for all shared types.
 * Re-exports from database, API, and Electron type definitions.
 */
export * from './database'
export * from './api'
export type {
  SaveFileDialogOptions,
  SaveTextFileOptions,
  SaveFileDialogResult,
  WriteFileResult,
  ExportExcelResult,
  ExecuteQueryPayload,
  FetchSchemaPayload,
  WriteFilePayload,
  ExportExcelPayload,
  ElectronAPI,
} from './electron'
