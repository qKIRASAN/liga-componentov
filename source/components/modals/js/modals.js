import {ScrollLock} from './scroll-lock';
import {FocusLock} from './focus-lock';

export class Modals {
  constructor(settings = {}) {
    this._scrollLock = new ScrollLock();
    this._focusLock = new FocusLock();

    this._modalOpenElements = document.querySelectorAll('[data-open-modal]');
    this._openedModalElement = null;
    this._modalName = null;
    this._settingKey = 'default';

    this._settings = settings;
    this._preventDefault = this._settings[this._settingKey].preventDefault;
    this._openTimeout = this._settings[this._settingKey].openTimeout;
    this._enableScrolling = this._settings[this._settingKey].enableScrolling;
    this._disableScrolling = this._settings[this._settingKey].disableScrolling;
    this._enableScrollTimeout = this._settings[this._settingKey].enableScrollTimeout;
    this._stopPlay = this._settings[this._settingKey].stopPlay;
    this._lockFocus = this._settings[this._settingKey].lockFocus;
    this._openCallback = this._settings[this._settingKey].openCallback;
    this._closeCallback = this._settings[this._settingKey].closeCallback;

    this._documentKeydownHandler = this._documentKeydownHandler.bind(this);
    this._documentClickHandler = this._documentClickHandler.bind(this);
    this._modalClickHandler = this._modalClickHandler.bind(this);

    this._init();
  }

  _init() {
    if (this._modalOpenElements.length) {
      document.addEventListener('click', this._documentClickHandler);
    }
  }

  _setSettings(settingKey = this._settingKey) {
    if (!this._settings[settingKey]) {
      return;
    }

    this._preventDefault = typeof this._settings[settingKey].preventDefault === 'boolean' ? this._settings[settingKey].preventDefault : this._settings[this._settingKey].preventDefault;
    this._enableScrolling = typeof this._settings[settingKey].enableScrolling === 'boolean' ? this._settings[settingKey].enableScrolling : this._settings[this._settingKey].enableScrolling;
    this._disableScrolling = typeof this._settings[settingKey].disableScrolling === 'boolean' ? this._settings[settingKey].disableScrolling : this._settings[this._settingKey].disableScrolling;
    this._stopPlay = typeof this._settings[settingKey].stopPlay === 'boolean' ? this._settings[settingKey].stopPlay : this._settings[this._settingKey].stopPlay;
    this._lockFocus = typeof this._settings[settingKey].lockFocus === 'boolean' ? this._settings[settingKey].lockFocus : this._settings[this._settingKey].lockFocus;

    this._openTimeout = typeof this._settings[settingKey].openTimeout === 'number' ? this._settings[settingKey].openTimeout : this._settings[this._settingKey].openTimeout;
    this._enableScrollTimeout = typeof this._settings[settingKey].enableScrollTimeout === 'number' ? this._settings[settingKey].enableScrollTimeout : this._settings[this._settingKey].enableScrollTimeout;

    this._openCallback = this._settings[settingKey].openCallback || this._settings[this._settingKey].openCallback;
    this._closeCallback = this._settings[settingKey].closeCallback || this._settings[this._settingKey].closeCallback;
  }

  _documentClickHandler(evt) {
    const target = evt.target;
    if (!target.closest('[data-open-modal]')) {
      return;
    }
    evt.preventDefault();
    this._modalName = target.dataset.openModal;
    if (!this._modalName) {
      return;
    }
    this.open();
  }

  _documentKeydownHandler(evt) {
    const isEscKey = evt.key === 'Escape' || evt.key === 'Esc';
    if (isEscKey) {
      evt.preventDefault();
      this.close(document.querySelector('.modal--active').dataset.modal);
    }
  }

  _modalClickHandler(evt) {
    const target = evt.target;
    if (!target.closest('[data-close-modal]')) {
      return;
    }

    this.close(target.closest('[data-modal]').dataset.modal);
  }

  _addListeners(modal) {
    modal.addEventListener('click', this._modalClickHandler);
    document.addEventListener('keydown', this._documentKeydownHandler);
  }

  _removeListeners(modal) {
    modal.removeEventListener('click', this._modalClickHandler);
    document.removeEventListener('keydown', this._documentKeydownHandler);
  }

  _stopInteractive(modal) {
    if (this._stopPlay) {
      modal.querySelectorAll('video, audio').forEach((el) => el.pause());
    }
  }

  open(modalName = this._modalName) {
    const modal = document.querySelector(`[data-modal="${modalName}"]`);

    if (!modal || modal.classList.contains('modal--active')) {
      return;
    }

    this._openedModalElement = document.querySelector('.modal--active');

    if (this._openedModalElement) {
      if (this._lockFocus) {
        this._focusLock.unlock('.modal--active');
      }
      this.close(this._openedModalElement.dataset.modal, false);
    }

    this._setSettings(modalName);
    setTimeout(() => {
      modal.classList.add('modal--active');
      this._addListeners(modal);
      if (this._openCallback) {
        this._openCallback();
      }
      if (this._disableScrolling) {
        this._scrollLock.disableScrolling();
      }
      if (this._lockFocus) {
        this._focusLock.lock('.modal--active');
      }
    }, this._openTimeout);
  }

  close(modalName = this._modalName, enableScrolling = this._enableScrolling) {
    const modal = document.querySelector(`[data-modal="${modalName}"]`);

    if (!modal || !modal.classList.contains('modal--active')) {
      return;
    }

    modal.classList.remove('modal--active');
    this._removeListeners(modal);
    this._stopInteractive(modal);

    if (this._lockFocus) {
      this._focusLock.unlock('.modal--active');
    }

    if (enableScrolling) {
      setTimeout(() => {
        this._scrollLock.enableScrolling();
      }, this._enableScrollTimeout);
    }

    if (this._closeCallback) {
      this._closeCallback();
    }

    this._setSettings('default');
  }
}