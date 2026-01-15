/**
 * Publication Loader - Auto-generates publication list from JSON data
 * Usage: Add publications to publications.json, they will be automatically rendered
 */

// Configuration
const CONFIG = {
  jsonPath: 'publications.json',
  containerId: 'publication-list',
  counterId: 'publication-count',
  authorName: 'Duan, X.', // Your name to highlight
  sortByYear: true,
  groupByYear: false, // Set to true if you want year headers
};

/**
 * Format authors with highlighting for the main author
 */
function formatAuthors(authors, highlightName) {
  return authors.map(author => {
    // Check if this author should be highlighted (contains the highlight name)
    const isHighlight = author.includes('Duan');
    if (isHighlight) {
      return `<b>${author}</b>`;
    }
    return author;
  }).join(', ');
}

/**
 * Format a single publication entry
 */
function formatPublication(pub) {
  let html = '';
  
  // Authors
  html += formatAuthors(pub.authors, CONFIG.authorName);
  
  // Year
  html += ` (${pub.year}). `;
  
  // Title
  html += pub.title + '. ';
  
  // Venue (italicized)
  html += `<i>${pub.venue}</i>`;
  
  // Volume and pages if available
  if (pub.volume) {
    html += `, ${pub.volume}`;
  }
  if (pub.pages) {
    html += `: ${pub.pages}`;
  }
  html += '. ';
  
  // Note (e.g., "in press")
  if (pub.note) {
    html += `(${pub.note}) `;
  }
  
  // Link - DOI or URL
  if (pub.doi) {
    html += `<a href="${pub.url || 'https://doi.org/' + pub.doi}" target="_blank">${pub.doi}</a>`;
  } else if (pub.url) {
    html += `<a href="${pub.url}" target="_blank">[Link]</a>`;
  }
  
  // PDF link if available
  if (pub.pdf) {
    html += ` <a href="${pub.pdf}" target="_blank">[pdf]</a>`;
  }
  
  return html;
}

/**
 * Get publication type label
 */
function getTypeLabel(type) {
  const labels = {
    'journal': 'Journal Article',
    'conference': 'Conference Paper',
    'workshop': 'Workshop Paper',
    'preprint': 'Preprint',
    'book_chapter': 'Book Chapter',
    'thesis': 'Thesis'
  };
  return labels[type] || type;
}

/**
 * Load and render publications
 */
async function loadPublications() {
  const container = document.getElementById(CONFIG.containerId);
  const counter = document.getElementById(CONFIG.counterId);
  
  if (!container) {
    console.error(`Container element #${CONFIG.containerId} not found`);
    return;
  }
  
  try {
    // Fetch publications data
    const response = await fetch(CONFIG.jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${CONFIG.jsonPath}`);
    }
    const publications = await response.json();
    
    // Sort by year (newest first)
    if (CONFIG.sortByYear) {
      publications.sort((a, b) => b.year - a.year);
    }
    
    // Update counter
    if (counter) {
      counter.textContent = publications.length;
    }
    
    // Generate HTML
    let html = '';
    let currentYear = null;
    
    publications.forEach((pub, index) => {
      // Add year header if grouping by year
      if (CONFIG.groupByYear && pub.year !== currentYear) {
        currentYear = pub.year;
        html += `<h5 style="margin-top: 20px; margin-bottom: 10px; color: #666;"><b>${currentYear}</b></h5>`;
      }
      
      html += formatPublication(pub);
      
      // Add line break between entries (except last)
      if (index < publications.length - 1) {
        html += '<br><br>';
      }
    });
    
    container.innerHTML = html;
    
    console.log(`Loaded ${publications.length} publications`);
    
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
    const response = await fetch(CONFIG.jsonPath);
    const publications = await response.json();
    
    const stats = {
      total: publications.length,
      byYear: {},
      byType: {}
    };
    
    publications.forEach(pub => {
      // Count by year
      stats.byYear[pub.year] = (stats.byYear[pub.year] || 0) + 1;
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
