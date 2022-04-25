import { closeTab, switchTab } from "../main";

export default class TabView {
  constructor() {
    this.$tabs = document.getElementById('tabs');
  }

  addTab(id, name) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.id = id;
    tab.append(name);
    const tabClose = document.createElement('span');
    tabClose.textContent = 'x';
    tabClose.className = 'tab-close';
    tab.append(tabClose);

    tab.addEventListener('click', e => {
      if (e.target.classList.contains('tab')) {
        switchTab(e.target.dataset.id);
      }
    });

    tabClose.addEventListener('click', e => {
      const id = e.target.parentNode.dataset.id;
      closeTab(id);
    });

    this.$tabs.appendChild(tab);
  }

  getTab(id) {
    return this.$tabs.querySelector(`[data-id="${id}"]`);
  }

  getIDOfPrevious(id) {
    const prev = this.getTab(id).previousSibling;

    if (prev != null) {
      return prev.dataset.id;
    }

    const next = this.getTab(id).nextSibling;
    return next?.dataset?.id;
  }

  removeTab(id) {
    this.getTab(id).remove();
  }
}