import { DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

export const activeVisualLine = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    observer: MutationObserver;
    highlightLayerEl: HTMLElement;

    constructor(view: EditorView) {
      this.createObserver(view);
    }

    createObserver(view: EditorView) {
      const config = { attributes: true, childList: true, subtree: true },
        selectionLayer = view.dom.querySelector(".cm-selectionLayer"),
        cursorLayer = view.dom.querySelector(".cm-cursorLayer"),
        contentDOM = view.dom;
      if (!selectionLayer || !cursorLayer) return;
      document.body.addClass("active-visual-line");
      this.highlightLayerEl = view.scrollDOM.createDiv("cm-highlightLayer");
      this.highlightLayerEl.ariaHidden = "true";
      const visualLineEl = this.highlightLayerEl.createDiv("cm-active-visual-line");
      let scrollBarProps = getComputedStyle(view.dom, "::-webkit-scrollbar");
      let scrollBarsEnabled = scrollBarProps.getPropertyValue("display");
      let scrollbarWidth = scrollBarsEnabled ? parseInt(scrollBarProps.getPropertyValue("width")) : 0;
      this.observer = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach(mutation => {
          let height: number, top: number;
          if (mutation.type === "childList") {
            let cursorEl = Array.from(mutation.addedNodes).find(
              el => el instanceof HTMLElement && el.hasClass("cm-cursor-primary")
            ) as HTMLElement;
            if (cursorEl) {
              height = parseInt(cursorEl.style.height);
              top = parseInt(cursorEl.style.top);
            }
          } else if (mutation.target instanceof HTMLElement && mutation.target.hasClass("cm-cursor-primary")) {
            height = parseInt(mutation.target.style.height);
            top = parseInt(mutation.target.style.top);
          }
          if (height && top) {
            let left = contentDOM.offsetLeft,
              width = contentDOM.offsetWidth - scrollbarWidth;
            visualLineEl.setAttribute(
              "style",
              `height: ${height + 6}px; top: ${top - 2}px; left: ${left}px; width: ${width}px;`
            );
          }
        });
      });
      this.observer.observe(cursorLayer, config);
    }

    update(update: ViewUpdate) {
      if (!this.observer) this.createObserver(update.view);
    }

    destroy() {
      this.observer && this.observer.disconnect();
      this.highlightLayerEl && this.highlightLayerEl.detach();
      document.body.removeClass("active-visual-line");
    }
  }
);
