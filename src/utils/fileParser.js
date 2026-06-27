import * as XLSX from 'xlsx'

/**
 * Detecta o tipo pelo nome do arquivo: vendasDDMMAAAA.xlsx / .pdf
 * Retorna array de { id, name, estoqueInicial, estoqueVenda, estoqueFinal, vendas }
 */
export async function parseVendasFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') return parseXLSX(file)
  if (ext === 'pdf') return parsePDF(file)
  throw new Error('Formato não suportado. Use .xlsx ou .pdf')
}

async function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: 0 })

        // Normaliza colunas comuns do sistema de PDV
        const items = rows.map((row, idx) => {
          const name = row['PRODUTO'] ?? row['Item'] ?? row['DESCRIÇÃO'] ?? row['produto'] ?? `Item ${idx + 1}`
          return {
            id: `item_${idx}`,
            name: String(name).trim(),
            estoqueInicial: toNum(row['EST.INICIAL'] ?? row['ESTOQUE INICIAL'] ?? row['estoque_inicial'] ?? 0),
            estoqueVenda:   toNum(row['EST.VENDA']   ?? row['ESTOQUE VENDA']   ?? row['em_venda']        ?? 0),
            estoqueFinal:   toNum(row['EST.FINAL']   ?? row['ESTOQUE FINAL']   ?? row['estoque_final']   ?? 0),
            vendas:         toNum(row['VENDAS']       ?? row['QTD VENDIDA']     ?? row['qtd_vendas']      ?? 0),
          }
        }).filter(it => it.name && it.name !== '0')

        resolve(items)
      } catch (err) {
        reject(new Error('Erro ao ler XLSX: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

async function parsePDF(file) {
  // Importação dinâmica para evitar problemas com SSR / tree-shaking
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    fullText += content.items.map(i => i.str).join(' ') + '\n'
  }

  // Parser simplificado: linhas com padrão NOME  NUM  NUM  NUM  NUM
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean)
  const items = []
  const numPat = /^-?\d+([.,]\d+)?$/

  lines.forEach((line, idx) => {
    const parts = line.split(/\s{2,}|\t/)
    const nums = parts.filter(p => numPat.test(p.replace(',', '.')))
    if (nums.length >= 2 && parts[0] && parts[0].length > 2) {
      items.push({
        id: `item_${idx}`,
        name: parts[0].trim(),
        estoqueInicial: toNum(nums[0]),
        estoqueVenda:   toNum(nums[1] ?? 0),
        estoqueFinal:   toNum(nums[2] ?? 0),
        vendas:         toNum(nums[3] ?? 0),
      })
    }
  })

  if (items.length === 0) throw new Error('Nenhum dado encontrado no PDF. Verifique o formato.')
  return items
}

function toNum(val) {
  if (typeof val === 'number') return val
  return parseFloat(String(val).replace(',', '.')) || 0
}

export function calcAuditoria(item) {
  const movimentacao = item.estoqueFinal - item.estoqueInicial
  const diff = item.vendas - movimentacao
  return { movimentacao, diff, status: diff === 0 ? 'ok' : 'alerta' }
}
