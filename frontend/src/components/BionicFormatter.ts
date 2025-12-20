// Pure functions for bionic text formatting

export const applyBionicFormatting = (html: string, percentage: number): string => {
    if (!html) return ''
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent
        if (text.trim()) {
          const words = text.split(/(\s+)/)
          const formatted = words.map(word => {
            if (!word.trim()) return word
            
            const match = word.match(/^(\W*)(\w+)(\W*)$/)
            if (!match) return word
            
            const [, prefix, core, suffix] = match
            const len = core.length
            let boldCount = 1
            
            if (len <= 2) boldCount = 1
            else if (len <= 5) boldCount = 2
            else boldCount = Math.max(1, Math.floor(len * percentage))
            
            const bold = core.slice(0, boldCount)
            const regular = core.slice(boldCount)
            
            return `${prefix}<strong>${bold}</strong>${regular}${suffix}`
          }).join('')
          
          const span = doc.createElement('span')
          span.innerHTML = formatted
          node.parentNode?.replaceChild(span, node)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (!['SCRIPT', 'STYLE', 'STRONG'].includes(element.tagName)) {
          Array.from(node.childNodes).forEach(processNode)
        }
      }
    }
    
    Array.from(doc.body.childNodes).forEach(processNode)
    return doc.body.innerHTML
  }
  
  export const stripBoldTags = (html: string): string => {
    if (!html) return ''
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const strongTags = doc.querySelectorAll('strong')
    strongTags.forEach(strong => {
      const textNode = doc.createTextNode(strong.textContent || '')
      strong.parentNode?.replaceChild(textNode, strong)
    })
    return doc.body.innerHTML
  }
  
  export const getFormattedContent = (
    content: string,
    bionicEnabled: boolean,
    boldPercentage: number
  ): string => {
    if (!content) return ''
    return bionicEnabled 
      ? applyBionicFormatting(content, boldPercentage)
      : stripBoldTags(content)
  }