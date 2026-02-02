
const TARGET_URLS = [
  'https://roadway.yahoo.co.jp/traffic/area/6/highway', // 中国地方
  'https://roadway.yahoo.co.jp/traffic/area/7/highway'  // 近畿地方
];

// Mock delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock axios.get
const mockAxiosGet = async (url) => {
  await delay(500); // Simulate 500ms network latency
  return { data: '<html>...</html>' };
};

// Sequential implementation (Current)
async function runSequential() {
  const start = performance.now();
  for (const url of TARGET_URLS) {
    await mockAxiosGet(url);
    // Parsing logic would go here, negligible time compared to network
  }
  const end = performance.now();
  return end - start;
}

// Parallel implementation (Optimized)
async function runParallel() {
  const start = performance.now();
  await Promise.all(TARGET_URLS.map(url => mockAxiosGet(url)));
  const end = performance.now();
  return end - start;
}

async function main() {
  console.log('--- Benchmark: Traffic API Request Strategy ---');
  console.log(`Simulating ${TARGET_URLS.length} requests with 500ms latency each.\n`);

  console.log('Running Sequential (Current)...');
  const seqTime = await runSequential();
  console.log(`Time: ${seqTime.toFixed(2)}ms`);

  console.log('\nRunning Parallel (Optimized)...');
  const parTime = await runParallel();
  console.log(`Time: ${parTime.toFixed(2)}ms`);

  const speedup = seqTime / parTime;
  console.log(`\nSpeedup: ${speedup.toFixed(2)}x`);
}

main();
