document.addEventListener('DOMContentLoaded', function() {
  const assetId = document.getElementById('assetId').value; 
  document.getElementById('commentsSection').addEventListener('submit', function(event) {
    event.preventDefault();
    const commentText = document.getElementById('commentText').value;
    const commentAuthor = document.getElementById('commentAuthor').value || 'Anonymous';

    fetch(`/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assetId: assetId, text: commentText, author: commentAuthor }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Comment submitted:', data);
      const commentsSection = document.getElementById('commentsContainer');
      const newCommentHTML = `
        <div class="comment">
          <p>${data.author || 'Anonymous'}: ${data.text}</p>
        </div>
      `;
      commentsSection.insertAdjacentHTML('beforeend', newCommentHTML);
      document.getElementById('commentText').value = '';
      document.getElementById('commentAuthor').value = '';
    })
    .catch(error => {
      console.error('Error submitting comment:', error.message, error.stack);
    });
  });

  // Fetch and display comments for the asset
  fetch(`/comments/assets/${assetId}`)
    .then(response => response.json())
    .then(comments => {
      const commentsSection = document.getElementById('commentsContainer');
      let commentsContent = '';
      if (comments.length === 0) {
        commentsContent += '<p>No comments yet. Be the first to comment!</p>';
      } else {
        comments.forEach(comment => {
          commentsContent += `
            <div class="comment">
              <p>${comment.author || 'Anonymous'}: ${comment.text}</p>
            </div>
          `;
        });
      }
      commentsSection.innerHTML = commentsContent;
    })
    .catch(error => {
      console.error('Error fetching comments:', error.message, error.stack);
    });
});