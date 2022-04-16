export function openFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', e => resolve(e.target.files));
    input.click();
  });
}

export function readAsText(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.readAsText(file);
  });
};

export function saveFile(filename, content) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function removeChildNodes(parent) {
  while (parent.firstChild != null) {
    parent.removeChild(parent.firstChild);
  }
}