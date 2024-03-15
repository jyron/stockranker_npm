document.addEventListener('DOMContentLoaded', function() {
  const fetchAssets = async () => {
    try {
      const response = await fetch('/assets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      populateCarousel(data);
      populateTable(data);
    } catch (error) {
      console.error('Failed to fetch assets:', error.message, error.stack);
    }
  };

  const populateCarousel = (assets) => {
    const carouselInner = document.querySelector('#assetCarousel');
    if (!carouselInner) {
      console.error('Carousel element not found.');
      return;
    }
    // Assuming carouselInner has the necessary structure or creating it dynamically
    let carouselItems = '';
    assets.forEach((asset, index) => {
      carouselItems += `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img src="${asset.logo}" class="d-block w-100" alt="${asset.name}">
          <div class="carousel-caption d-none d-md-block">
            <h5>${asset.name} (${asset.ticker})</h5>
            <p>$${asset.price}</p>
          </div>
        </div>
      `;
    });
    carouselInner.innerHTML = carouselItems;
  };

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
          <td>${asset.ticker}</td>
          <td>${asset.name}</td>
          <td>$${asset.price}</td>
          <td>${asset.voteCount}</td>
          <td>${asset.commentCount}</td>
          <td>${asset.industry}</td>
        </tr>
      `;
    });
    tableBody.innerHTML = tableRows;
  };

  fetchAssets();
});