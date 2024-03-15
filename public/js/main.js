// Function to update asset vote count
function voteOnAsset(ticker, vote) {
  fetch(`/assets/${ticker}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vote }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Vote updated:', data);
    // Update the UI without reloading the page
    document.querySelector(`[data-asset-ticker="${ticker}"] .vote-count`).textContent = data.voteCount;
  })
  .catch(error => {
    console.error('Error voting on asset:', error.message, error.stack);
  });
}

// Function to submit a comment
function submitComment(assetId, text, author = '') {
  fetch('/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assetId, text, author }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Comment submitted:', data);
    // Instead of reloading the page, dynamically update the comments section
    updateCommentsSection(assetId);
  })
  .catch(error => {
    console.error('Error submitting comment:', error.message, error.stack);
  });
}

// Function to handle asset search/filter
function searchAssets(query) {
  fetch(`/assets?search=${query}`)
  .then(response => response.json())
  .then(data => {
    updateAssetsTable(data);
  })
  .catch(error => {
    console.error('Error searching assets:', error.message, error.stack);
  });
}

// Event listeners for voting, submitting comments, and searching
document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('comment-form');
  const searchInput = document.getElementById('searchAssets');

  // Add event listener to comment form if it exists
  if(commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const assetId = commentForm.getAttribute('data-asset-id');
      const text = commentForm.querySelector('textarea[name="comment"]').value;
      const author = commentForm.querySelector('input[name="author"]').value || 'Anonymous';
      submitComment(assetId, text, author);
    });
  }

  // Add event listener to search input if it exists
  if(searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      searchAssets(query);
    });
  }

  // Re-attach event listeners to vote buttons every time the assets table is updated AND for initial vote buttons
  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const ticker = button.getAttribute('data-ticker');
      const vote = parseInt(button.getAttribute('data-vote'), 10);
      voteOnAsset(ticker, vote);
    });
  });
});

// Function to update asset price in UI
function updateAssetPriceInUI(asset, price) {
  // Find the asset row by ticker and update its price
  const assetRow = document.querySelector(`[data-asset-ticker="${asset}"]`);
  if (assetRow) {
    const priceCell = assetRow.querySelector('.asset-price');
    if (priceCell) {
      priceCell.textContent = `$${price}`;
    }
  }
}

// Function to update assets table with filtered search results or all assets
function updateAssetsTable(data) {
  const tableBody = document.getElementById('assetsTable');
  if (!tableBody) {
    console.error('Assets table body element not found.');
    return;
  }
  let tableRows = '';
  data.forEach(asset => {
    tableRows += `
      <tr data-asset-ticker="${asset.ticker}">
        <td><img src="${asset.logo}" alt="${asset.name}" style="width: 50px;"></td>
        <td>${asset.ticker}</td>
        <td>${asset.name}</td>
        <td class="asset-price">$${asset.price}</td>
        <td class="vote-count">${asset.voteCount}</td>
        <td>${asset.commentCount}</td>
        <td>${asset.industry}</td>
        <td><button class="vote-button" data-ticker="${asset.ticker}" data-vote="1">Upvote</button></td>
      </tr>
    `;
  });
  tableBody.innerHTML = tableRows;

  // Re-attach event listeners to vote buttons every time the assets table is updated AND for initial vote buttons
  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const ticker = button.getAttribute('data-ticker');
      const vote = parseInt(button.getAttribute('data-vote'), 10);
      voteOnAsset(ticker, vote);
    });
  });
}

// Function to dynamically update the comments section after a new comment is added
function updateCommentsSection(assetId) {
  // Fetch the latest comments for the asset
  fetch(`/assets/${assetId}/comments`)
  .then(response => response.json())
  .then(comments => {
    const commentsSection = document.getElementById('commentsSection');
    if (!commentsSection) {
      console.error('Comments section element not found.');
      return;
    }
    let commentsHTML = '';
    comments.forEach(comment => {
      commentsHTML += `
        <div class="comment">
          <p>${comment.author || 'Anonymous'}: ${comment.text}</p>
        </div>
      `;
    });
    commentsSection.innerHTML = commentsHTML;
  })
  .catch(error => {
    console.error('Error updating comments section:', error.message, error.stack);
  });
}