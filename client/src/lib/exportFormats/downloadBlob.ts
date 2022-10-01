export function downloadBlob(blob, filename) {
  const link = URL.createObjectURL(blob)
  const element = document.createElement('a');
  element.setAttribute('href', link);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
