const PAGE_SRC = './page_src'
const QUERY_STR = '#md-container'

/**
 * Regex Template, automatically escapes
 * template literals, and compiles to regex.
 *
 * Usage: <pre>
 * const string = 't(o)mato!'
 * let compiled = RegTemp `${string}`
 *
 * // equivalent to
 * let compiled = new RegExp('/to\\(o\\)mato\\!/')
 * </pre>
 *
 * @param {string} Template literal
 * @return RegEx with template variables escaped
 */
function RegTemp(strings, ...vars) {
  return new RegExp(strings[0] + vars.map(
    (val, i) => (
      String(val).replace(/([^a-zA-Z0-9])/g, '\\$1') + strings[i + 1]
    )
  ).join(''))
}

/**
 * Hash Relative Markdown links, traverses
 * an element, and checks if it contains a
 * relative link ending with '.md', and
 * converts it to a hash link.
 *
 * e.g <pre>
 * const a = document.createElement('A')
 * a.href = 'test.md'
 * hashRelLink(a)
 * a.href === '#test'
 * </pre>
 *
 * @param {Element} Element to traverse
 */
function hashRelMDLinks(element) {
  if (element.tagName === 'A') {
    // Get current page path & build required regex
    const path = window.location.href.replace(/\/([^\/]*?$)/, '')
    const pathRegex = RegTemp `${path}\/(.*).md(?:#.*)?`

    // Check if link is relative `.md` file.
    const match = element.href.match(pathRegex)

    if (match) {
      element.href = '#' + match[1]
    }
  } else {
    // Recurse through children elements
    for (const child of element.children) {
      hashRelMDLinks(child)
    }
  }
}

// Loader script
window.onload = window.onhashchange = function() {
  const hash = window.location.hash
  const target = hash ? hash.substring(1) : 'index'
  const container = document.querySelector(QUERY_STR)

  fetch(`${PAGE_SRC}/${target}.md`)
    .then(res => {
      if (res.ok) {
        return res.text()
      } else {
        const errorTitle = `${res.status} ${res.statusText}`
        return `<center>${errorTitle}</center>`
      }
    })
    .then(text => {
      const mdText = katexit.render(text)
      const dom = new DOMParser()
      const doc = dom.parseFromString(mdText, 'text/html')

      document.title = doc.body.firstChild.innerText

      // Empty container then append parsed elements
      container.innerHTML = ''
      for (let child of doc.body.childNodes) {
        container.appendChild(child)
      }

      // Convert relative markdown links to hash links
      hashRelMDLinks(container)
    })
}
