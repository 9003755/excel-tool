import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Play, Settings, Eye, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { FileData, ProcessedRow, ProcessingOptions, ProcessingProgress } from '../types'
import { processExcelFiles } from '../utils/excelProcessor'

interface ProcessPageProps {
  templateFile: FileData
  sourceFile: FileData
  onProcessComplete: (files: FileData[], merged: FileData) => void
  onBack: () => void
}

export default function ProcessPage({
  templateFile,
  sourceFile,
  onProcessComplete,
  onBack
}: ProcessPageProps) {
  const [sourceData, setSourceData] = useState<ProcessedRow[]>([])
  const [templatePreview, setTemplatePreview] = useState<any[][]>([])
  const [options, setOptions] = useState<ProcessingOptions>({
    month: new Date().getMonth() + 1,
    columnMapping: {
      A: 'A',
      B: 'B', 
      C: 'C',
      D: 'G'
    }
  })
  const [progress, setProgress] = useState<ProcessingProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: ''
  })
  const [showPreview, setShowPreview] = useState(false)

  // 解析源文件数据
  useEffect(() => {
    const parseSourceFile = () => {
      try {
        const workbook = XLSX.read(sourceFile.data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        
        const rows: ProcessedRow[] = []
        for (let i = 1; i < jsonData.length; i++) { // 从第二行开始
          const row = jsonData[i] as any[]
          if (row && row.length > 0 && row[0]) { // 确保行不为空
            rows.push({
              name: row[0]?.toString() || '',
              columnA: row[0]?.toString() || '',
              columnB: row[1]?.toString() || '',
              columnC: row[2]?.toString() || '',
              columnD: row[3]?.toString() || ''
            })
          }
        }
        setSourceData(rows)
      } catch (error) {
        console.error('解析源文件失败:', error)
        alert('解析源文件失败，请检查文件格式')
      }
    }

    parseSourceFile()
  }, [sourceFile])

  // 解析模板文件预览
  useEffect(() => {
    const parseTemplateFile = () => {
      try {
        const workbook = XLSX.read(templateFile.data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        setTemplatePreview(jsonData.slice(0, 10) as any[][]) // 只显示前10行
      } catch (error) {
        console.error('解析模板文件失败:', error)
      }
    }

    parseTemplateFile()
  }, [templateFile])

  const handleProcess = useCallback(async () => {
    if (sourceData.length === 0) {
      alert('没有可处理的数据')
      return
    }

    setProgress({
      current: 0,
      total: sourceData.length,
      status: 'processing',
      message: '开始处理...'
    })

    try {
      const result = await processExcelFiles(
        templateFile,
        sourceData,
        options,
        (current, total, message) => {
          setProgress({
            current,
            total,
            status: 'processing',
            message
          })
        }
      )

      setProgress({
        current: sourceData.length,
        total: sourceData.length,
        status: 'completed',
        message: '处理完成！'
      })

      onProcessComplete(result.individualFiles, result.mergedFile)
    } catch (error) {
      console.error('处理失败:', error)
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: '处理失败: ' + (error as Error).message
      })
    }
  }, [sourceData, templateFile, options, onProcessComplete])

  const getColumnLetter = (index: number): string => {
    let result = ''
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result
      index = Math.floor(index / 26) - 1
    }
    return result
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">数据处理</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? '隐藏预览' : '显示预览'}</span>
          </button>
        </div>
      </div>

      {/* 文件信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">模板文件</h3>
          <p className="text-gray-600">{templateFile.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(templateFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">数据源文件</h3>
          <p className="text-gray-600">{sourceFile.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(sourceFile.size / 1024).toFixed(1)} KB • {sourceData.length} 行数据
          </p>
        </div>
      </div>

      {/* 处理参数设置 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          请输入训练月份
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月份设置 (1-12)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={options.month}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                month: parseInt(e.target.value) || 1
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              将更新模板中J、M、N、O、P列的日期月份
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              列映射设置
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>数据源A列</span>
                <span>→ 模板{options.columnMapping.A}列</span>
              </div>
              <div className="flex justify-between">
                <span>数据源B列</span>
                <span>→ 模板{options.columnMapping.B}列</span>
              </div>
              <div className="flex justify-between">
                <span>数据源C列</span>
                <span>→ 模板{options.columnMapping.C}列</span>
              </div>
              <div className="flex justify-between">
                <span>数据源D列</span>
                <span>→ 模板{options.columnMapping.D}列</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据预览 */}
      {showPreview && (
        <div className="space-y-6">
          {/* 源数据预览 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">源数据预览</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      A列
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      B列
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      C列
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      D列
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sourceData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.columnA}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.columnB}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.columnC}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.columnD}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sourceData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  显示前5行，共{sourceData.length}行数据
                </p>
              )}
            </div>
          </div>

          {/* 模板预览 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">模板预览</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {templatePreview[0]?.map((_, colIndex) => (
                      <th key={colIndex} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getColumnLetter(colIndex)}
                      </th>
                    )).slice(0, 10)}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templatePreview.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.slice(0, 10).map((cell, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cell?.toString() || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-2 text-center">
                显示前5行10列
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 处理进度 */}
      {progress.status !== 'idle' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">处理进度</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{progress.message}</span>
              <span className="text-sm text-gray-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.status === 'error'
                    ? 'bg-red-500'
                    : progress.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-primary'
                }`}
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                }}
              ></div>
            </div>
            {progress.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">处理失败，请检查文件格式或重试</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 开始处理按钮 */}
      <div className="text-center">
        <button
          onClick={handleProcess}
          disabled={progress.status === 'processing' || sourceData.length === 0}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto space-x-2"
        >
          <Play className="w-5 h-5" />
          <span>
            {progress.status === 'processing'
              ? '处理中...'
              : `开始处理 (${sourceData.length} 行数据)`}
          </span>
        </button>
      </div>
    </div>
  )
}