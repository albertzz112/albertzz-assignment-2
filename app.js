const canvas = document.getElementById('kmeans-canvas');
const ctx = canvas.getContext('2d');
let points = [];
let centroids = [];
let clusters = [];
let steps = [];

// Generate random dataset
document.getElementById('generate-data').addEventListener('click', generateDataset);

function generateDataset() {
  points = [];
  centroids = [];
  steps = [];
  clusters = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Generate random points
  for (let i = 0; i < 100; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    });
  }
  drawPoints();
}

// Function to draw points on the canvas
function drawPoints() {
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
  });
}

// Handle initialization method selection
document.getElementById('init-method').addEventListener('change', function () {
  const method = this.value;
  switch (method) {
    case 'random':
      initializeRandom();
      break;
    case 'farthest':
      initializeFarthestFirst();
      break;
    case 'kmeans++':
      initializeKMeansPP();
      break;
    case 'manual':
      enableManualSelection();
      break;
  }
});

// Get number of centroids from the dropdown
function getCentroidCount() {
  return parseInt(document.getElementById('centroid-count').value, 10);
}

// Random initialization
function initializeRandom() {
  const count = getCentroidCount();
  centroids = [];
  for (let i = 0; i < count; i++) {
    centroids.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    });
  }
  drawCentroids();
}

// Farthest First initialization
function initializeFarthestFirst() {
    const count = getCentroidCount();
    centroids = [];
    
    // Choose the first random centroid
    centroids.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    });
  
    while (centroids.length < count) {
      let maxDistance = -1;
      let nextCentroid = null;
  
      // For each point, find the closest centroid
      points.forEach(point => {
        // Calculate the distance to the nearest centroid
        let minDistance = Math.min(...centroids.map(centroid => {
          return Math.hypot(point.x - centroid.x, point.y - centroid.y);
        }));
  
        // If the minimum distance to any centroid is greater than the maxDistance found so far,
        // we have a candidate for the next centroid
        if (minDistance > maxDistance) {
          maxDistance = minDistance;
          nextCentroid = point;
        }
      });
  
      // Add the farthest point as the next centroid only if a nextCentroid is found
      if (nextCentroid) {
        centroids.push(nextCentroid);
      }
    }
  
    drawCentroids();
  }
  
// KMeans++ initialization
function initializeKMeansPP() {
  const count = getCentroidCount();
  centroids = [];
  centroids.push(points[Math.floor(Math.random() * points.length)]); // Choose first random point

  for (let i = 1; i < count; i++) {
    let maxDistance = 0;
    let nextCentroid = points[0];

    points.forEach(point => {
      let minDistance = Math.min(...centroids.map(centroid => {
        return Math.hypot(point.x - centroid.x, point.y - centroid.y);
      }));
      if (minDistance > maxDistance) {
        maxDistance = minDistance;
        nextCentroid = point;
      }
    });
    centroids.push(nextCentroid);
  }
  drawCentroids();
}

// Manual initialization
function enableManualSelection() {
  const count = getCentroidCount();
  centroids = [];
  canvas.addEventListener('click', function selectCentroids(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (centroids.length < count) {
      centroids.push({ x, y });
      drawCentroids();
    }
    if (centroids.length === count) {
      canvas.removeEventListener('click', selectCentroids);
    }
  });
}

// Function to draw centroids on the canvas
function drawCentroids() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPoints();
  centroids.forEach(centroid => {
    ctx.beginPath();
    ctx.arc(centroid.x, centroid.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  });
}

// Step through the algorithm
document.getElementById('step-algorithm').addEventListener('click', stepThroughAlgorithm);

function stepThroughAlgorithm() {
  if (centroids.length < getCentroidCount()) {
    alert('Please select an initialization method.');
    return;
  }

  if (steps.length === 0) {
    assignClusters();
  }

  if (steps.length > 0) {
    drawStep(steps.shift());
  }
}

function assignClusters() {
  const count = getCentroidCount();
  clusters = Array.from({ length: count }, () => []); // Initialize clusters based on centroid count
  steps = [];

  // Assign each point to the nearest centroid
  points.forEach(point => {
    let minDistance = Infinity;
    let assignedCluster = 0;

    centroids.forEach((centroid, i) => {
      const distance = Math.hypot(point.x - centroid.x, point.y - centroid.y);
      if (distance < minDistance) {
        minDistance = distance;
        assignedCluster = i;
      }
    });
    clusters[assignedCluster].push(point);
  });

  steps.push({ clusters: JSON.parse(JSON.stringify(clusters)), centroids: JSON.parse(JSON.stringify(centroids)) });
  updateCentroids();
}

function updateCentroids() {
  const count = getCentroidCount();
  let newCentroids = Array.from({ length: count }, () => ({ x: 0, y: 0, count: 0 }));

  // Update the centroids to be the mean of their respective clusters
  clusters.forEach((cluster, clusterIndex) => {
    cluster.forEach(point => {
      newCentroids[clusterIndex].x += point.x;
      newCentroids[clusterIndex].y += point.y;
      newCentroids[clusterIndex].count++;
    });
  });

  centroids = newCentroids.map(centroid => ({
    x: centroid.count ? centroid.x / centroid.count : 0,
    y: centroid.count ? centroid.y / centroid.count : 0,
  }));

  steps.push({ clusters: JSON.parse(JSON.stringify(clusters)), centroids: JSON.parse(JSON.stringify(centroids)) });
}

// Function to draw the current step of the clustering process
function drawStep(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw points color-coded by cluster
  step.clusters.forEach((cluster, i) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan']; // Extend colors if needed
    cluster.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = colors[i % colors.length]; // Cycle through colors
      ctx.fill();
      ctx.closePath();
    });
  });

  // Draw centroids
  step.centroids.forEach(centroid => {
    ctx.beginPath();
    ctx.arc(centroid.x, centroid.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  });
}

// Reset the clustering process
document.getElementById('reset').addEventListener('click', function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  points = [];
  centroids = [];
  steps = [];
  clusters = [];
});

// Go to convergence button
document.getElementById('converge').addEventListener('click', function () {
  if (centroids.length < getCentroidCount()) {
    alert('Please select an initialization method.');
    return;
  }

  let oldCentroids;
  do {
    oldCentroids = JSON.stringify(centroids); // Store centroids to check if they change
    assignClusters();
    updateCentroids();
  } while (JSON.stringify(centroids) !== oldCentroids);

  // Draw the final clustering result
  drawStep({ clusters, centroids });
});
