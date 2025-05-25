import * as XLSX from 'xlsx'

/**
 * 导出数据为 Excel 文件
 * @param headers 表头数组，例如：['姓名', '年龄', '性别']
 * @param data 数据数组，例如：[['张三', 25, '男'], ['李四', 30, '女']]
 * @param fileName 文件名，不需要包含扩展名
 */
export const exportToExcel = (headers: string[], data: any[][], fileName: string = 'export') => {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 将表头和数据合并
    const worksheetData = [headers, ...data]
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // 设置列宽（可选）
    const colWidths = headers.map(() => ({ wch: 15 }))
    worksheet['!cols'] = colWidths
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    // 导出文件
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
    
    return true
  } catch (error) {
    console.error('导出 Excel 失败:', error)
    throw new Error('导出失败，请重试')
  }
}

/**
 * 导出对象数组为 Excel 文件
 * @param headers 表头配置，例如：[{key: 'name', label: '姓名'}, {key: 'age', label: '年龄'}]
 * @param data 对象数组，例如：[{name: '张三', age: 25}, {name: '李四', age: 30}]
 * @param fileName 文件名，不需要包含扩展名
 */
export const exportObjectsToExcel = (
  headers: { key: string; label: string }[], 
  data: Record<string, any>[], 
  fileName: string = 'export'
) => {
  try {
    // 提取表头标签
    const headerLabels = headers.map(h => h.label)
    
    // 根据表头配置提取数据
    const extractedData = data.map(item => 
      headers.map(header => item[header.key] || '')
    )
    
    // 调用基础导出函数
    return exportToExcel(headerLabels, extractedData, fileName)
  } catch (error) {
    console.error('导出 Excel 失败:', error)
    throw new Error('导出失败，请重试')
  }
}

/**
 * 导出带样式的 Excel 文件
 * @param headers 表头数组
 * @param data 数据数组
 * @param fileName 文件名
 * @param options 可选配置
 */
export const exportStyledExcel = (
  headers: string[], 
  data: any[][], 
  fileName: string = 'export',
  options: {
    sheetName?: string
    headerStyle?: boolean
    autoWidth?: boolean
  } = {}
) => {
  try {
    const { sheetName = 'Sheet1', headerStyle = true, autoWidth = true } = options
    
    const workbook = XLSX.utils.book_new()
    const worksheetData = [headers, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // 自动调整列宽
    if (autoWidth) {
      const colWidths = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map(row => String(row[index] || '').length)
        )
        return { wch: Math.min(maxLength + 2, 30) }
      })
      worksheet['!cols'] = colWidths
    }
    
    // 设置表头样式（简单的加粗效果）
    if (headerStyle) {
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFCCCCCC' } }
          }
        }
      })
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
    
    return true
  } catch (error) {
    console.error('导出样式化 Excel 失败:', error)
    throw new Error('导出失败，请重试')
  }
}
