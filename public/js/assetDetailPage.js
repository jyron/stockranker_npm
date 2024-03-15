document.addEventListener('DOMContentLoaded', function() {
  const assetId = window.location.pathname.split('/').pop(); // Assuming URL format /assetDetail/{assetId}

  // Fetch asset information
  fetch(`/assets/${assetId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('assetInfo').innerHTML = `
        <h2>${data.name} (${data.ticker})</h2>
        <p>Industry: ${data.industry}</p>
        <p>Price: $${data.price}</p>
        <p>Vote Count: ${data.voteCount}</p>
        <p>Comment Count: ${data.commentCount}</p>
      `;
    })
    .catch(error => {
      console.error('Error fetching asset information:', error);
    });

  // Fetch asset news
  fetch(`/assets/${assetId}/news`)
    .then(response => response.json())
    .then(news => {
      const newsContainer = document.getElementById('assetNews');
      if (news.length === 0) {
        newsContainer.innerHTML = '<p>No news available for this asset.</p>';
      } else {
        news.forEach(item => {
          const newsItem = document.createElement('div');
          newsItem.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <a href="${item.url}" target="_blank">Read more</a>
          `;
          newsContainer.appendChild(newsItem);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching asset news:', error);
    });

  // Fetch comments for the asset
  fetch(`/assets/${assetId}/comments`)
    .then(response => response.json())
    .then(comments => {
      const commentsSection = document.getElementById('commentsSection');
      if (comments.length === 0) {
        commentsSection.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
      } else {
        comments.forEach(comment => {
          const commentElement = document.createElement('div');
          commentElement.className = 'comment';
          commentElement.innerHTML = `
            <p>${comment.author || 'Anonymous'}: ${comment.text}</p>
          `;
          commentsSection.appendChild(commentElement);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
    });
});