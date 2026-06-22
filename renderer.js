async function extract() {
  try {
    const res = await window.api.extractArchive();

    if (!res) return;

    if (res.type === 'docx') {
      alert(res.message);
      return;
    }

    alert(`Extracted successfully!\nFolder: ${res.folder}`);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}