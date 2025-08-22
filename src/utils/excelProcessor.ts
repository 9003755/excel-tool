import * as XLSX from 'xlsx'
import { FileData, ProcessedRow, ProcessingOptions } from '../types'

export interface ProcessResult {
  individualFiles: FileData[]
  mergedFile: FileData
}

export async function processExcelFiles(
  templateFile: FileData,
  sourceData: ProcessedRow[],
  options: ProcessingOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<ProcessResult> {
  const individualFiles: FileData[] = []
  const allProcessedWorkbooks: XLSX.WorkBook[] = []

  // 解析模板文件 - 支持多种格式包括WPS
  let templateWorkbook: XLSX.WorkBook
  try {
    // 尝试读取文件，支持Excel和WPS格式
    templateWorkbook = XLSX.read(templateFile.data, { 
      type: 'array',
      cellFormula: true,
      cellStyles: true,
      cellNF: true,
      cellHTML: false,
      cellText: false,
      cellDates: true,
      dateNF: 'yyyy/m/d',
      raw: false
    })
    
    console.log('模板文件解析成功，格式:', detectFileFormat(templateFile.name))
    console.log('工作表数量:', templateWorkbook.SheetNames.length)
    console.log('工作表名称:', templateWorkbook.SheetNames)
  } catch (error) {
    console.error('模板文件解析失败:', error)
    throw new Error(`无法解析模板文件 "${templateFile.name}"。请确保文件格式正确（支持 .xlsx, .xls, .et 等格式）`)
  }
  
  for (let i = 0; i < sourceData.length; i++) {
    const row = sourceData[i]
    onProgress?.(i + 1, sourceData.length, `正在处理 ${row.name} 的数据...`)
    
    // 创建模板的副本
    const workbookCopy = cloneWorkbook(templateWorkbook)
    
    // 填充数据到工作簿
    fillDataToWorkbook(workbookCopy, row, options)
    
    // 生成文件名
    const fileName = `${row.name}+${templateFile.name}`
    
    // 转换为ArrayBuffer
    const buffer = XLSX.write(workbookCopy, { 
      type: 'array', 
      bookType: 'xlsx' 
    })
    
    const fileData: FileData = {
      name: fileName,
      data: buffer,
      size: buffer.byteLength,
      lastModified: Date.now()
    }
    
    individualFiles.push(fileData)
    allProcessedWorkbooks.push(workbookCopy)
    
    // 添加小延迟以避免阻塞UI
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  // 创建合并文件
  onProgress?.(sourceData.length, sourceData.length, '正在生成合并文件...')
  const mergedFile = await createMergedFile(allProcessedWorkbooks, sourceData)
  
  return {
    individualFiles,
    mergedFile
  }
}

// 检测文件格式
function detectFileFormat(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'xlsx':
      return 'Excel 2007+ (.xlsx)'
    case 'xls':
      return 'Excel 97-2003 (.xls)'
    case 'et':
      return 'WPS Office (.et)'
    case 'ett':
      return 'WPS Template (.ett)'
    case 'csv':
      return 'CSV (.csv)'
    case 'ods':
      return 'OpenDocument (.ods)'
    default:
      return `未知格式 (.${extension})`
  }
}

function cloneWorkbook(workbook: XLSX.WorkBook): XLSX.WorkBook {
  // 深度克隆工作簿，保持所有格式和属性
  const cloned: XLSX.WorkBook = {
    SheetNames: [...workbook.SheetNames],
    Sheets: {}
  }
  
  // 复制工作簿属性（如果存在）
  if ((workbook as any).Props) {
    (cloned as any).Props = { ...(workbook as any).Props }
  }
  if ((workbook as any).SSF) {
    (cloned as any).SSF = { ...(workbook as any).SSF }
  }
  
  workbook.SheetNames.forEach(sheetName => {
    const originalSheet = workbook.Sheets[sheetName]
    const clonedSheet: XLSX.WorkSheet = {}
    
    // 复制所有单元格及其完整属性
    Object.keys(originalSheet).forEach(cellAddress => {
      if (cellAddress.startsWith('!')) {
        // 复制工作表属性（如 !ref, !margins 等）
        clonedSheet[cellAddress] = originalSheet[cellAddress]
      } else {
        // 复制单元格的所有属性
        const originalCell = originalSheet[cellAddress]
        if (originalCell && typeof originalCell === 'object') {
          clonedSheet[cellAddress] = {
            ...originalCell,
            // 确保所有属性都被复制
            v: originalCell.v,
            t: originalCell.t,
            f: originalCell.f,
            F: originalCell.F,
            r: originalCell.r,
            h: originalCell.h,
            w: originalCell.w,
            z: originalCell.z, // 数字格式
            l: originalCell.l,
            s: originalCell.s  // 样式信息
          }
        }
      }
    })
    
    cloned.Sheets[sheetName] = clonedSheet
  })
  
  return cloned
}

function fillDataToWorkbook(
  workbook: XLSX.WorkBook,
  rowData: ProcessedRow,
  options: ProcessingOptions
): void {
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  
  if (!worksheet) return
  
  // 获取工作表范围
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  
  // 填充A、B、C列数据，D列映射到G列
  fillColumnData(worksheet, 'A', rowData.columnA, range)
  fillColumnData(worksheet, 'B', rowData.columnB, range)
  fillColumnData(worksheet, 'C', rowData.columnC, range)
  fillColumnData(worksheet, 'G', rowData.columnD, range) // D列映射到G列
  
  // 更新月份 - 只进行简单字符串替换
  updateMonthInColumns(worksheet, options.month, ['J', 'M', 'N', 'O', 'P'], range)
}

function fillColumnData(
  worksheet: XLSX.WorkSheet,
  column: string,
  value: string,
  range: XLSX.Range
): void {
  // 从第二行开始填充，直到遇到空行
  for (let row = 1; row <= range.e.r; row++) {
    const cellAddress = `${column}${row + 1}`
    const cell = worksheet[cellAddress]
    
    // 如果当前行为空，停止填充
    if (!cell || !cell.v) {
      break
    }
    
    // 填充数据，只更新值，完全保持原有格式和属性
    worksheet[cellAddress] = {
      ...cell, // 保持所有原有属性
      v: value  // 只更新值
    }
  }
}

function updateMonthInColumns(
  worksheet: XLSX.WorkSheet,
  month: number,
  columns: string[],
  range: XLSX.Range
): void {
  console.log('\n=== 开始月份替换处理 ===')
  console.log('目标月份:', month, '处理列:', columns.join(', '))
  
  let replacedCount = 0
  
  columns.forEach(column => {
    console.log(`\n--- 处理列 ${column} ---`)
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = `${column}${row + 1}`
      const cell = worksheet[cellAddress]
      
      if (cell && cell.v !== undefined && cell.v !== null) {
        // 获取单元格的原始值和格式化文本
        let cellValue = String(cell.v)
        let formattedText = ''
        
        try {
          // 尝试获取格式化显示文本
          formattedText = XLSX.utils.format_cell(cell)
        } catch (e) {
          // 如果格式化失败，使用原始值
          formattedText = cellValue
        }
        
        console.log(`${cellAddress}: 原始值="${cell.v}", 格式化文本="${formattedText}"`)
        
        // 简单的月份替换逻辑：只查找 "/3/" 字符串
        let targetFound = false
        let newValue = ''
        let sourceText = formattedText || cellValue
        
        // 只检查是否包含 "/3/"
        if (sourceText.includes('/3/')) {
          newValue = sourceText.replace(/\/3\//g, `/${month}/`)
          targetFound = true
          console.log(`✓ 找到 "/3/": "${sourceText}" -> "${newValue}"`)
        }
        
        if (targetFound) {
          console.log(`🔄 替换单元格 ${cellAddress}: "${sourceText}" -> "${newValue}"`)
          
          // 更新单元格值，保持原有格式
          worksheet[cellAddress] = {
            ...cell,
            v: newValue,
            t: 's' // 设置为字符串类型以保持格式
          }
          
          console.log(`✅ 替换完成: ${cellAddress} = "${newValue}"`)
          replacedCount++
        } else {
          console.log(`❌ 未找到 "/3/": ${cellAddress} = "${sourceText}"`)
        }
      }
    }
  })
  
  console.log(`\n=== 月份替换完成，共替换 ${replacedCount} 个单元格 ===\n`)
}



async function createMergedFile(
  workbooks: XLSX.WorkBook[],
  sourceData: ProcessedRow[]
): Promise<FileData> {
  if (workbooks.length === 0) {
    throw new Error('没有可合并的工作簿')
  }
  
  // 使用第一个工作簿作为基础
  const baseWorkbook = cloneWorkbook(workbooks[0])
  const firstSheetName = baseWorkbook.SheetNames[0]
  const mergedSheet = baseWorkbook.Sheets[firstSheetName]
  
  // 获取基础工作表的行数
  const baseRange = XLSX.utils.decode_range(mergedSheet['!ref'] || 'A1')
  let currentRow = baseRange.e.r + 1
  
  // 合并其他工作簿的数据
  for (let i = 1; i < workbooks.length; i++) {
    const workbook = workbooks[i]
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
    
    // 复制数据行（跳过标题行），保持所有格式
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const sourceAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const targetAddress = XLSX.utils.encode_cell({ r: currentRow, c: col })
        
        if (sheet[sourceAddress]) {
          // 完整复制单元格的所有属性
          const sourceCell = sheet[sourceAddress]
          mergedSheet[targetAddress] = {
            ...sourceCell,
            v: sourceCell.v,
            t: sourceCell.t,
            f: sourceCell.f,
            F: sourceCell.F,
            r: sourceCell.r,
            h: sourceCell.h,
            w: sourceCell.w,
            z: sourceCell.z, // 保持数字格式
            l: sourceCell.l,
            s: sourceCell.s  // 保持样式信息
          }
        }
      }
      currentRow++
    }
  }
  
  // 更新合并工作表的范围
  mergedSheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: currentRow - 1, c: baseRange.e.c }
  })
  
  // 生成合并文件
  const buffer = XLSX.write(baseWorkbook, {
    type: 'array',
    bookType: 'xlsx'
  })
  
  return {
    name: '飞行记录合并表.xlsx',
    data: buffer,
    size: buffer.byteLength,
    lastModified: Date.now()
  }
}