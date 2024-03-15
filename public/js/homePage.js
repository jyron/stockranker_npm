document.addEventListener('DOMContentLoaded', function() {
  const fetchAssets = async () => {
    try {
      const response = await fetch('/assets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      populateTable(data); // Removed populateCarousel call as requested
    } catch (error) {
      console.error('Failed to fetch assets:', error.message, error.stack);
      document.getElementById('errorContainer').innerText = 'Failed to load assets. Please try again later.';
    }
  };

  // Removed the populateCarousel function as requested

  const populateTable = (assets) => {
    const tableBody = document.querySelector('#assetsTable');
    if (!tableBody) {
      console.error('Assets table body element not found.');
      return;
    }
    let tableRows = '';
    assets.forEach(asset => {
      tableRows += `
        <tr>
          <td><img src="${asset.logo}" alt="${asset.name}" style="width: 50px;"></td>
          <td><a href="/assets/${asset.ticker}/detail">${asset.ticker}</a></td>
          <td><a href="/assets/${asset.ticker}/detail">${asset.name}</a></td>
          <td>$${asset.price}</td>
          <td id="voteCount-${asset.ticker}">${asset.voteCount}</td>
          <td>${asset.commentCount}</td>
          <td>${asset.industry}</td>
          <td>
            <button class="vote-button" data-ticker="${asset.ticker}" data-vote="1">Upvote</button>
            <button class="vote-button" data-ticker="${asset.ticker}" data-vote="-1">Downvote</button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = tableRows;
    attachVoteEventListeners();
  };

  const searchAssets = (query) => {
    fetch(`/assets?search=${query}`)
      .then(response => response.json())
      .then(data => {
        populateTable(data);
      })
      .catch(error => {
        console.error('Error searching assets:', error.message, error.stack);
        document.getElementById('errorContainer').innerText = 'Error searching assets. Please try again.';
      });
  };

  const searchInput = document.getElementById('searchAssets');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      searchAssets(query);
    });
  }

  const attachVoteEventListeners = () => {
    document.querySelectorAll('.vote-button').forEach(button => {
      button.addEventListener('click', function() {
        const ticker = this.getAttribute('data-ticker');
        const vote = parseInt(this.getAttribute('data-vote'), 10);
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
          const voteCountElement = document.getElementById(`voteCount-${ticker}`);
          if (voteCountElement) {
            voteCountElement.textContent = data.voteCount;
          } else {
            console.error(`Vote count element not found for ticker ${ticker}`);
          }
        })
        .catch(error => {
          console.error('Error voting on asset:', error.message, error.stack);
        });
      });
    });
  };

  fetchAssets(); // Initial call to fetch assets and populate the table on page load
});