import MarkdownIt from 'markdown-it'
import mk from '@traptitech/markdown-it-katex'

window.katexit = new MarkdownIt({ html: true }).use(mk)