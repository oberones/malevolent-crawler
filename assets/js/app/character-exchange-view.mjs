/**
 * Attach read-only clipboard and download actions to existing exchange controls.
 * @param {Document} document Owner of the selectable export field.
 * @returns {object} bind(root), download(text, filename, host?); no persistence side effects.
 */
export function createCharacterExchangeView(document) {
  // Dispatch a local text download, releasing its temporary URL after activation.
  function download(text, filename, host = document.body) {
    const window = document.defaultView;
    const url = window.URL.createObjectURL(
      new window.Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    host.append(link);
    link.click();
    link.remove();
    // Release the completed download resource after browser activation.
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }
  return {
    download,
    /** Bind one rendered exchange; a pending copy cannot update a detached replacement. */
    bind(root) {
      const input = root.querySelector("#export-input");
      const copy = root.querySelector("#copy-export");
      const status = document.createElement("p");
      status.id = "exchange-status";
      status.setAttribute("role", "status");
      const save = document.createElement("button");
      save.id = "export-download";
      save.textContent = "Download character";

      // Download the same validated selectable text.
      save.onclick = () =>
        download(input.value, "malevolent-crawler-character.txt");
      copy.after(status, save);
      copy.onclick = async () => {
        // Report success only after the clipboard promise fulfills.
        copy.disabled = true;
        status.textContent = "Copying…";
        input.select();
        try {
          await document.defaultView.navigator.clipboard.writeText(input.value);
          if (status.isConnected) status.textContent = "Copied.";
        } catch {
          if (status.isConnected)
            status.textContent =
              "Copy unavailable. Select the text or download your character.";
        } finally {
          if (copy.isConnected) copy.disabled = false;
        }
      };
    },
  };
}
