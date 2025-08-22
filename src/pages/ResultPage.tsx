import { useState } from 'react'
import { Download, FileSpreadsheet, Package, Home, CheckCircle } from 'lucide-react'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { FileData } from '../types'

interface ResultPageProps {
  processedFiles: FileData[]
  mergedFile: FileData | null
  onBackToHome: () => void
}

export default function ResultPage({
  processedFiles,
  mergedFile,
  onBackToHome
}: ResultPageProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownloadSingle = async (file: FileData) => {
    setDownloading(file.name)
    try {
      const blob = new Blob([file.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      saveAs(blob, file.name)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAll = async () => {
    setDownloading('all')
    try {
      const zip = new JSZip()
      
      // 添加个人文件
      processedFiles.forEach(file => {
        zip.file(file.name, file.data)
      })
      
      // 添加合并文件
      if (mergedFile) {
        zip.file(mergedFile.name, mergedFile.data)
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `Excel批量处理结果_${new Date().toISOString().split('T')[0]}.zip`)
    } catch (error) {
      console.error('打包下载失败:', error)
      alert('打包下载失败，请重试')
    } finally {
      setDownloading(null)
    }
  }

  const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0) + 
                   (mergedFile ? mergedFile.size : 0)

  return (
    <div className="space-y-6">
      {/* 成功提示 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-green-900">
              处理完成！
            </h2>
            <p className="text-green-700 mt-1">
              成功生成 {processedFiles.length} 个个人文件和 1 个合并文件
            </p>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">
            {processedFiles.length}
          </div>
          <div className="text-gray-600">个人文件</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">
            1
          </div>
          <div className="text-gray-600">合并文件</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-primary mb-2">
            {formatFileSize(totalSize)}
          </div>
          <div className="text-gray-600">总文件大小</div>
        </div>
      </div>

      {/* 批量下载 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            批量下载
          </h3>
          <button
            onClick={handleDownloadAll}
            disabled={downloading === 'all'}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>
              {downloading === 'all' ? '打包中...' : '下载全部文件 (ZIP)'}
            </span>
          </button>
        </div>
        <p className="text-gray-600">
          将所有生成的文件打包为ZIP格式下载，包含 {processedFiles.length + 1} 个文件
        </p>
      </div>

      {/* 合并文件 */}
      {mergedFile && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            合并文件
          </h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{mergedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(mergedFile.size)} • 合并了所有数据
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadSingle(mergedFile)}
                disabled={downloading === mergedFile.name}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloading === mergedFile.name ? '下载中...' : '下载'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 个人文件列表 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          个人文件 ({processedFiles.length})
        </h3>
        <div className="space-y-3">
          {processedFiles.map((file, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle(file)}
                  disabled={downloading === file.name}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === file.name ? '下载中...' : '下载'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 操作历史说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          处理说明
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• 已按照设定的列映射规则填充数据</p>
          <p>• 已更新指定列的月份信息</p>
          <p>• 每个数据行生成一个独立的Excel文件</p>
          <p>• 所有文件已合并为一个统一的表格</p>
          <p>• 保持了原模板的格式和样式</p>
        </div>
      </div>

      {/* 返回首页 */}
      <div className="text-center">
        <button
          onClick={onBackToHome}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center mx-auto space-x-2"
        >
          <Home className="w-5 h-5" />
          <span>返回首页</span>
        </button>
      </div>
    </div>
  )
}