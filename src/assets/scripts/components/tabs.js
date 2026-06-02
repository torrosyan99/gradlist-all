
class Tabs {
  static ACTIVE_TAB_CLASS = 'tabs__item--active';
  static ACTIVE_PANEL_CLASS = 'tabs-panel--active';

  constructor(tabs) {
    this.tabs = {};
    this.init(tabs);
  }

  init(tabs) {
    [...tabs.children].forEach((button, index) => {
      const tabs =
        document.querySelectorAll(`.tabs-panel[data-tabs-panel="${button.dataset.tab}"]`)
      console.log(button)
      this.tabs[button.dataset.tab] = tabs.length > 0 ? [...tabs] : [];
      if (index === 0) this.activePanels(button)
    });

    tabs.addEventListener('click', (e) => {
      const button = e.target.closest('.tabs__item');


      if (button && button !== this.activeButton) {
        this.removePanels();
        this.activePanels(button)
      }
    })
  }

  removePanels() {
    this.activeButton.classList.remove(Tabs.ACTIVE_TAB_CLASS);
    this.tabs[this.activeButton.dataset.tab].forEach((tab) => {
      tab.classList.remove(Tabs.ACTIVE_PANEL_CLASS);
    });
  }

  activePanels(button) {
    button.classList.add(Tabs.ACTIVE_TAB_CLASS);
    this.activeButton = button;
    this.tabs[button.dataset.tab].forEach((tab) => {
      tab.classList.add(Tabs.ACTIVE_PANEL_CLASS);
    });
  }
}


const tabs = document.querySelectorAll('.tabs-buttons');

for (let i = 0; i < tabs.length; i++) {
  new Tabs(tabs[i]);
}