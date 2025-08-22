import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, Info, Download } from 'lucide-react'
import { FileData } from '../types'

interface HomePageProps {
  onFilesUploaded: (template: FileData, source: FileData) => void
}

export default function HomePage({ onFilesUploaded }: HomePageProps) {
  const [templateFile, setTemplateFile] = useState<FileData | null>(null)
  const [sourceFile, setSourceFile] = useState<FileData | null>(null)
  const [dragOver, setDragOver] = useState<'template' | 'source' | null>(null)

  const handleFileRead = useCallback((file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve({
            name: file.name,
            data: e.target.result as ArrayBuffer,
            size: file.size,
            lastModified: file.lastModified
          })
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const handleFileDrop = useCallback(async (
    e: React.DragEvent<HTMLDivElement>,
    type: 'template' | 'source'
  ) => {
    e.preventDefault()
    setDragOver(null)
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )
    
    if (!excelFile) {
      alert('请选择Excel文件（.xlsx或.xls格式）')
      return
    }

    try {
      const fileData = await handleFileRead(excelFile)
      if (type === 'template') {
        setTemplateFile(fileData)
      } else {
        setSourceFile(fileData)
      }
    } catch (error) {
      alert('文件读取失败，请重试')
    }
  }, [handleFileRead])

  const handleFileSelect = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'template' | 'source'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请选择Excel文件（.xlsx或.xls格式）')
      return
    }

    try {
      const fileData = await handleFileRead(file)
      if (type === 'template') {
        setTemplateFile(fileData)
      } else {
        setSourceFile(fileData)
      }
    } catch (error) {
      alert('文件读取失败，请重试')
    }
  }, [handleFileRead])

  const handleNext = () => {
    if (templateFile && sourceFile) {
      onFilesUploaded(templateFile, sourceFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Excel批量处理工具
          </h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          快速批量填写Excel表格，支持模板映射、数据填充和文件合并
        </p>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-red-700 text-sm font-medium">
            ⚠️ 须上传专用格式的文件，否则软件无法识别
          </p>
        </div>
      </div>

      {/* 步骤指引 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-primary" />
          使用步骤
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">上传模板文件</p>
              <p className="text-sm text-gray-500">选择Excel模板文件</p>
              <p className="text-xs text-red-600 mt-1">⚠️ 必须使用专用模板格式</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">上传数据源</p>
              <p className="text-sm text-gray-500">选择包含数据的Excel文件</p>
              <p className="text-xs text-orange-600 mt-1">💡 确保数据格式正确</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">处理下载</p>
              <p className="text-sm text-gray-500">自动处理并下载结果</p>
              <p className="text-xs text-green-600 mt-1">✅ 生成个人及合并表格</p>
            </div>
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 模板文件上传 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            1. 选择Excel模板文件
          </h3>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver === 'template'
                ? 'border-primary bg-blue-50'
                : templateFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver('template')
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleFileDrop(e, 'template')}
          >
            {templateFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium text-gray-900">{templateFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(templateFile.size)}</p>
                <button
                  onClick={() => setTemplateFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600">拖拽Excel文件到此处，或</p>
                  <label className="inline-block mt-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileSelect(e, 'template')}
                      className="hidden"
                    />
                    <span className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                      点击选择文件
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">支持 .xlsx 和 .xls 格式</p>
              </div>
            )}
          </div>
        </div>

        {/* 数据源文件上传 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. 选择数据源文件
          </h3>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver === 'source'
                ? 'border-primary bg-blue-50'
                : sourceFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver('source')
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleFileDrop(e, 'source')}
          >
            {sourceFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium text-gray-900">{sourceFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(sourceFile.size)}</p>
                <button
                  onClick={() => setSourceFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600">拖拽Excel文件到此处，或</p>
                  <label className="inline-block mt-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileSelect(e, 'source')}
                      className="hidden"
                    />
                    <span className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                      点击选择文件
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">支持 .xlsx 和 .xls 格式</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          功能说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">处理功能</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自动批量填充数据</li>
              <li>• 月份替换功能</li>
              <li>• 生成个人表格</li>
              <li>• 自动合并表格</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">重要提示</h4>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 font-medium">⚠️ 文件格式要求</p>
                <p className="text-yellow-700">模板文件必须使用指定格式，包含特定的列结构和月份标记</p>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <p className="text-blue-800 font-medium">💡 数据源要求</p>
                <p className="text-blue-700">数据源文件需按A、B、C、D列顺序排列数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下一步按钮 */}
      {templateFile && sourceFile && (
        <div className="text-center">
          <button
            onClick={handleNext}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto space-x-2"
          >
            <span>开始处理</span>
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}