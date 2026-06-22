const bar = document.getElementById('bar');
const status = document.getElementById('status');

window.api.onProgress((data) => {
  bar.style.width = data.percent + '%';
  status.innerText = data.message;

  // 🔥 success highlight
  if (data.percent === 100) {
    status.style.color = "#22c55e";
  }
});

async function extract() {
  status.innerText = "Selecting file...";
  bar.style.width = "0%";
  await window.api.extract();
}

async function create() {
  status.innerText = "Creating archive...";
  bar.style.width = "0%";
  await window.api.create();
}

async function cancel() {
  await window.api.cancel();
  status.innerText = "Cancelled";
  bar.style.width = "0%";
}