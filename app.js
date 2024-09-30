const canvas = document.getElementById('kmeans-canvas');
const ctx = canvas.getContext('2d');
let points = [];
let centroids = [];
let clusters = [];
let steps = [];

// Generate random dataset
document.getElementById('generate-data').addEventListener('click', generateRandomDataset);

function generateRandomDataset() {
  points = [];
  centroids = [];
  steps = [];
  clusters = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Generate random points in clusters
  for (let i = 0; i < 30; i++) {
    points.push({
      x: Math.random() * (canvas.width / 3), // Cluster 1
      y: Math.random() * (canvas.height / 3)
    });
    points.push({
      x: Math.random() * (canvas.width / 3) + (canvas.width / 3) * 2, // Cluster 2
      y: Math.random() * (canvas.height / 3)
    });
    points.push({
      x: Math.random() * (canvas.width / 3) + (canvas.width / 3), // Cluster 3
      y: Math.random() * (canvas.height / 3) + (canvas.height / 3)
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

// Random initialization (select from points)
function initializeRandom() {
  centroids = [];
  const selectedIndices = [];

  while (centroids.length < 3) {
    const index = Math.floor(Math.random() * points.length);
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
      centroids.push(points[index]);
    }
  }
  drawCentroids();
}

// Farthest First initialization
function initializeFarthestFirst() {
  centroids = [];
  centroids.push(points[Math.floor(Math.random() * points.length)]); // Choose first random point

  for (let i = 1; i < 3; i++) {
    let maxDistance = 0;
    let farthestPoint = points[0];

    points.forEach(point => {
      let minDistance = Infinity;

      centroids.forEach(centroid => {
        const distance = Math.hypot(point.x - centroid.x, point.y - centroid.y);
        if (distance < minDistance) {
          minDistance = distance;
        }
      });

      // Choose the point with the maximum of the minimum distances
      if (minDistance > maxDistance) {
        maxDistance = minDistance;
        farthestPoint = point;
      }
    });

    centroids.push(farthestPoint);
  }

  drawCentroids();
}

// KMeans++ initialization (select from points)
function initializeKMeansPP() {
  centroids = [];
  centroids.push(points[Math.floor(Math.random() * points.length)]); // Choose first random point

  for (let i = 1; i < 3; i++) {
    let maxDistance = 0;
    let nextCentroid = points[0];

    points.forEach(point => {
      let minDistance = Infinity;
      centroids.forEach(centroid => {
        const distance = Math.hypot(point.x - centroid.x, point.y - centroid.y);
        if (distance < minDistance) minDistance = distance;
      });
      if (minDistance > maxDistance) {
        maxDistance = minDistance;
        nextCentroid = point;
      }
    });
    centroids.push(nextCentroid);
  }
  drawCentroids();
}

// Manual initialization (select centroids from the plot)
function enableManualSelection() {
  centroids = [];
  canvas.addEventListener('click', function selectCentroids(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the closest point to the click
    let closestPoint = null;
    let minDistance = Infinity;
    points.forEach(point => {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    if (closestPoint && centroids.length < 3) {
      centroids.push(closestPoint);
      drawCentroids();
    }

    if (centroids.length === 3) {
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
  if (centroids.length < 3) {
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

// Assign points to clusters
function assignClusters() {
  clusters = [[], [], []];
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

// Update the centroids based on the current clusters
function updateCentroids() {
  let newCentroids = [];

  // Update the centroids to be the mean of their respective clusters
  clusters.forEach(cluster => {
    let sumX = 0, sumY = 0;
    cluster.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    newCentroids.push({
      x: sumX / cluster.length,
      y: sumY / cluster.length
    });
  });

  centroids = newCentroids;
  steps.push({ clusters: JSON.parse(JSON.stringify(clusters)), centroids: JSON.parse(JSON.stringify(centroids)) });
}

// Draw the current step
function drawStep(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw points color-coded by cluster
  step.clusters.forEach((cluster, i) => {
    const colors = ['blue', 'green', 'purple'];
    cluster.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = colors[i];
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
  if (centroids.length < 3) {
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
