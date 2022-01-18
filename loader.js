const PAGE_SRC = 'page_src'
const PAGE_URL = new URL(`${PAGE_SRC}/`, window.location)

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
 * Check if URL shares the same origin as the window
 *
 * @param {string} A url string
 * @return boolean whether the URL shares the same origin
 */

function isLocalURL(url) {
  return new URL(url).origin === window.location.origin
}

/**
 * Fix Relative links, traverses an element
 * and converts image links to direct links
 * and markdown links to hash links
 *
 * e.g <pre>
 * const a = document.createElement('A')
 * a.href = 'test.md'
 * hashRelLink(a)
 * a.href === '#test.md'
 * </pre>
 *
 * @param {Element} Element to traverse
 */
function fixRelLinks(element) {
  const hashDir = window.location.hash.substring(1).replace(/([^\/#]*?$)/, '')

  if (element.tagName === 'A') {
    const hrefMatch = element.outerHTML.match(/href=\"(.*?).md\"/)
    if (hrefMatch && isLocalURL(element.href)) {
      const absURL = new URL('./' + hashDir + hrefMatch[1], PAGE_URL)
      const target = absURL.pathname.substring(PAGE_URL.pathname.length)
      element.href = `#${target}.md`
    }
  } else if (element.src) {
    const srcMatch = element.outerHTML.match(/src=\"(.*?)\"/)
    if (srcMatch && isLocalURL(element.src)) {
      const src = new URL(hashDir + srcMatch[1], PAGE_URL)
      element.src = src
    }
  } else {
    // Recurse through children elements
    for (const child of element.children) {
      fixRelLinks(child)
    }
  }
}

function showDocument(container, text) {
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
  fixRelLinks(container)
}

function showError(container, errorMessage) {
  document.title = errorMessage
  container.innerHTML = `<center>${errorMessage}</center>`
}

// Loader script
function initLoader(queryStr) {
  window.onload = window.onhashchange = function() {
    const hash = window.location.hash
    const target = hash ? hash.substring(1) : 'index.md'
    const absURL = new URL('./' + target, PAGE_URL)
    const container = document.querySelector(queryStr)

    // Check if path is outside of PAGE_SRC
    if (absURL.pathname.substring(0, PAGE_URL.pathname.length) !== PAGE_URL.pathname) {
      showError(container, 'Path not in source directory')
      return
    }

    fetch(absURL)
      .then(res => {
        if (res.ok) {
          return res.text().then(text => showDocument(container, text))
        } else {
          return showError(container, `${res.status} ${res.statusText}`)
        }
      })
  }
}