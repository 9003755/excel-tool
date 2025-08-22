import { useState } from 'react'
import HomePage from './pages/HomePage'
import ProcessPage from './pages/ProcessPage'
import ResultPage from './pages/ResultPage'
import { FileData } from './types'

type PageType = 'home' | 'process' | 'result'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [templateFile, setTemplateFile] = useState<FileData | null>(null)
  const [sourceFile, setSourceFile] = useState<FileData | null>(null)
  const [processedFiles, setProcessedFiles] = useState<FileData[]>([])
  const [mergedFile, setMergedFile] = useState<FileData | null>(null)

  const handleFilesUploaded = (template: FileData, source: FileData) => {
    setTemplateFile(template)
    setSourceFile(source)
    setCurrentPage('process')
  }

  const handleProcessComplete = (files: FileData[], merged: FileData) => {
    setProcessedFiles(files)
    setMergedFile(merged)
    setCurrentPage('result')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
    setTemplateFile(null)
    setSourceFile(null)
    setProcessedFiles([])
    setMergedFile(null)
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Excel批量处理工具
            </h1>
            <nav className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 italic mr-4">
                作者：海边的飞行器
              </span>
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'home'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                首页
              </button>
              {templateFile && sourceFile && (
                <button
                  onClick={() => setCurrentPage('process')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'process'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  处理
                </button>
              )}
              {processedFiles.length > 0 && (
                <button
                  onClick={() => setCurrentPage('result')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'result'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  结果
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage onFilesUploaded={handleFilesUploaded} />
        )}
        {currentPage === 'process' && templateFile && sourceFile && (
          <ProcessPage
            templateFile={templateFile}
            sourceFile={sourceFile}
            onProcessComplete={handleProcessComplete}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'result' && (
          <ResultPage
            processedFiles={processedFiles}
            mergedFile={mergedFile}
            onBackToHome={handleBackToHome}
          />
        )}
      </main>
    </div>
  )
}

export default App
