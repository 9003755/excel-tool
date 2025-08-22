export interface FileData {
  name: string
  data: ArrayBuffer
  workbook?: any
  size: number
  lastModified: number
}

export interface ProcessedRow {
  name: string
  columnA: string
  columnB: string
  columnC: string
  columnD: string
}

export interface ProcessingOptions {
  month: number
  columnMapping: {
    A: string
    B: string
    C: string
    D: string
  }
}

export interface ProcessingProgress {
  current: number
  total: number
  status: 'idle' | 'processing' | 'completed' | 'error'
  message: string
}