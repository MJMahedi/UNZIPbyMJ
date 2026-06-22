async function extract() {
  try {
    const res = await window.api.extractArchive();

    if (res?.success) {
      alert("✅ Extract Done!");
    } else {
      alert("❌ " + (res?.error || "Failed"));
    }
  } catch (err) {
    alert(err.message);
  }
}

async function createArchive() {
  try {
    const res = await window.api.createArchive();

    if (res?.success) {
      alert("✅ Archive Created!");
    } else {
      alert("❌ " + (res?.error || "Failed"));
    }
  } catch (err) {
    alert(err.message);
  }
}