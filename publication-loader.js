/**
 * Publication Loader - Auto-generates publication list from BibTeX file
 * Usage: Add publications to publications.bib, they will be automatically rendered
 */

// Configuration
const CONFIG = {
  bibPath: 'publications.bib',
  containerId: 'publication-list',
  counterId: 'publication-count',
  authorHighlight: 'Duan', // Name to highlight (partial match)
  sortByYear: true,
};

/**
 * Auto-detect and fill DOI/URL from journal, booktitle, or key
 */
function autoFillLinks(entry) {
  const venue = entry.journal || entry.booktitle || '';
  const key = entry.key || '';

  // Skip if DOI and URL already exist
  if (entry.doi && entry.url) return entry;

  // Pattern matchers for various preprint servers and venues
  const patterns = [
    // arXiv: "arXiv preprint arXiv:2601.07411" or "arXiv:2601.07411"
    {
      regex: /arXiv[:\s]+(?:preprint\s+)?(?:arXiv[:\s]+)?(\d{4}\.\d{4,5}(?:v\d+)?)/i,
      sources: [venue, key],
      handler: (match) => ({
        doi: `10.48550/arXiv.${match[1]}`,
        url: `https://arxiv.org/abs/${match[1]}`
      })
    },
    // PsyArXiv: "PsyArXiv preprint" with doi pattern
    {
      regex: /osf\.io\/([a-z0-9]+)/i,
      sources: [entry.doi || '', entry.url || '', venue],
      handler: (match) => ({
        doi: `10.31234/osf.io/${match[1]}`,
        url: `https://doi.org/10.31234/osf.io/${match[1]}`
      })
    },
    // bioRxiv
    {
      regex: /bioRxiv[:\s]+(?:preprint\s+)?(?:bioRxiv[:\s]+)?(\d{4}\.\d{2}\.\d{2}\.\d+)/i,
      sources: [venue, key],
      handler: (match) => ({
        doi: `10.1101/${match[1]}`,
        url: `https://www.biorxiv.org/content/10.1101/${match[1]}`
      })
    },
    // ACL Anthology from key (e.g., "2025.coling-main.677")
    {
      regex: /(\d{4}\.[a-z]+-[a-z]+\.\d+)/i,
      sources: [key, entry.url || ''],
      handler: (match) => ({
        url: `https://aclanthology.org/${match[1]}/`
      })
    },
    // DOI pattern in venue or note (e.g., "doi:10.1234/...")
    {
      regex: /(?:doi[:\s]+)?(10\.\d{4,}\/[^\s,}]+)/i,
      sources: [venue, entry.note || ''],
      handler: (match) => ({
        doi: match[1],
        url: `https://doi.org/${match[1]}`
      })
    }
  ];

  // Try each pattern
  for (const pattern of patterns) {
    for (const source of pattern.sources) {
      if (!source) continue;
      const match = source.match(pattern.regex);
      if (match) {
        const links = pattern.handler(match);
        if (!entry.doi && links.doi) entry.doi = links.doi;
        if (!entry.url && links.url) entry.url = links.url;
        break;
      }
    }
    // Stop if we have both
    if (entry.doi && entry.url) break;
  }

  return entry;
}

/**
 * Parse BibTeX file into structured data
 */
function parseBibTeX(bibContent) {
  const entries = [];

  // Match each BibTeX entry: @type{key, ... }
  const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,([^@]*?)(?=\n@|\n*$)/gs;

  let match;
  while ((match = entryRegex.exec(bibContent)) !== null) {
    const entryType = match[1].toLowerCase();
    const entryKey = match[2].trim();
    const fieldsStr = match[3];

    // Parse fields
    const entry = {
      type: entryType,
      key: entryKey,
    };

    // Match field = {value} or field = "value" or field = number
    const fieldRegex = /(\w+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|(\d+))/g;

    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase();
      const fieldValue = fieldMatch[2] || fieldMatch[3] || fieldMatch[4];
      entry[fieldName] = fieldValue ? fieldValue.trim() : '';
    }

    // Auto-fill DOI and URL from venue/key
    autoFillLinks(entry);

    entries.push(entry);
  }

  return entries;
}

/**
 * Format author string with highlighting
 */
function formatAuthors(authorStr, highlightName) {
  if (!authorStr) return '';

  // Split by " and " 
  const authors = authorStr.split(/\s+and\s+/i);

  return authors.map(author => {
    author = author.trim();
    // Check if should highlight
    if (author.toLowerCase().includes(highlightName.toLowerCase())) {
      return `<b>${author}</b>`;
    }
    return author;
  }).join(', ');
}

/**
 * Get venue string based on entry type
 */
function getVenue(entry) {
  if (entry.journal) return entry.journal;
  if (entry.booktitle) return entry.booktitle;
  if (entry.publisher) return entry.publisher;
  return '';
}

/**
 * Format a single publication entry
 */
function formatPublication(entry) {
  let html = '';

  // Authors
  if (entry.author) {
    html += formatAuthors(entry.author, CONFIG.authorHighlight);
    html += ' ';
  }

  // Year
  if (entry.year) {
    html += `(${entry.year}). `;
  }

  // Title
  if (entry.title) {
    html += entry.title + '. ';
  }

  // Venue (italicized)
  const venue = getVenue(entry);
  if (venue) {
    html += `<i>${venue}</i>`;
  }

  // Volume, number, pages
  if (entry.volume) {
    html += `, ${entry.volume}`;
    if (entry.number) {
      html += `(${entry.number})`;
    }
  }
  if (entry.pages) {
    html += `: ${entry.pages}`;
  }
  if (venue || entry.volume || entry.pages) {
    html += '. ';
  }

  // Address
  if (entry.address) {
    html += `${entry.address}. `;
  }

  // Note (e.g., "in press", "*equal contribution")
  if (entry.note) {
    html += `(${entry.note}) `;
  }

  // Link - DOI or URL
  if (entry.doi) {
    const doiUrl = entry.doi.startsWith('http') ? entry.doi : `https://doi.org/${entry.doi}`;
    html += `<a href="${doiUrl}" target="_blank">${entry.doi}</a>`;
  } else if (entry.url) {
    html += `<a href="${entry.url}" target="_blank">[Link]</a>`;
  }

  // PDF link if available
  if (entry.pdf) {
    html += ` <a href="${entry.pdf}" target="_blank">[pdf]</a>`;
  }

  return html;
}

/**
 * Load and render publications from BibTeX file
 */
async function loadPublications() {
  const container = document.getElementById(CONFIG.containerId);
  const counter = document.getElementById(CONFIG.counterId);

  if (!container) {
    console.error(`Container element #${CONFIG.containerId} not found`);
    return;
  }

  try {
    // Fetch BibTeX file
    const response = await fetch(CONFIG.bibPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${CONFIG.bibPath}`);
    }
    const bibContent = await response.text();

    // Parse BibTeX
    let publications = parseBibTeX(bibContent);

    // Sort by year (newest first)
    if (CONFIG.sortByYear) {
      publications.sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
      });
    }

    // Update counter
    if (counter) {
      counter.textContent = publications.length;
    }

    // Generate HTML
    let html = '';

    publications.forEach((pub, index) => {
      html += formatPublication(pub);

      // Add line break between entries (except last)
      if (index < publications.length - 1) {
        html += '<br><br>';
      }
    });

    container.innerHTML = html;

    console.log(`Loaded ${publications.length} publications from BibTeX`);

  } catch (error) {
    console.error('Error loading publications:', error);
    container.innerHTML = '<p style="color: red;">Error loading publications. Please refresh the page.</p>';
  }
}

/**
 * Get statistics about publications
 */
async function getPublicationStats() {
  try {
    const response = await fetch(CONFIG.bibPath);
    const bibContent = await response.text();
    const publications = parseBibTeX(bibContent);

    const stats = {
      total: publications.length,
      byYear: {},
      byType: {}
    };

    publications.forEach(pub => {
      // Count by year
      if (pub.year) {
        stats.byYear[pub.year] = (stats.byYear[pub.year] || 0) + 1;
      }
      // Count by type
      stats.byType[pub.type] = (stats.byType[pub.type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}

// Auto-load when DOM is ready
document.addEventListener('DOMContentLoaded', loadPublications);
