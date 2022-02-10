import { Plugin } from "obsidian";
import { activeVisualLine } from "./view-plugin";

export default class ActiveVisualLinePlugin extends Plugin {
  async onload() {
    this.registerEditorExtension(activeVisualLine);
  }
}
