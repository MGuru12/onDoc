/**
 * Custom EditorJS Media Tool for Images and Videos
 * Supports file upload and URL input
 */
class MediaTool {
  static get toolbox() {
    return {
      title: 'Media',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};
    
    // API endpoints
    this.uploadEndpoint = this.config.uploadEndpoint || 'http://localhost:3001/file/upload';
    this.fileBaseUrl = this.config.fileBaseUrl || 'http://localhost:3001/file/';
    
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      type: data.type || 'image', // 'image' or 'video'
      fileName: data.fileName || '',
      stretched: data.stretched !== undefined ? data.stretched : false,
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground: data.withBackground !== undefined ? data.withBackground : false,
    };

    this.wrapper = undefined;
    this.settings = [
      {
        name: 'withBorder',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.043h2.25zm-7.2-2.138h2.4v2.138h-2.4v-2.138zm2.4-2.138h2.4v2.138h-2.4v-2.138zm-2.4-2.138h2.4v2.138h-2.4v-2.138zm-2.4 0h2.4v2.138h-2.4v-2.138zm-2.4 2.138h2.4v2.138h-2.4v-2.138zm0 2.138h2.4v2.138h-2.4v-2.138zm0 2.138h2.4v2.138h-2.4v-2.138z"/></svg>'
      },
      {
        name: 'stretched',
        icon: '<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.375 1.755L12.974 9.78a1.125 1.125 0 0 1-1.59-1.591L13.568 5.925z"/></svg>'
      },
      {
        name: 'withBackground',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09V8.265c0-1.15.985-2.085 2.2-2.085h5.343z"/><path d="M14.356 5.025H8.8c-1.215 0-2.2.936-2.2 2.09v8.762c0 1.154.985 2.09 2.2 2.09h5.556c1.215 0 2.2-.936 2.2-2.09V7.115c0-1.154-.985-2.09-2.2-2.09z"/></svg>'
      }
    ];
  }

  render() {
    this.wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]);
    
    const loader = this._make('div', this.CSS.loader);
    this.wrapper.appendChild(loader);

    if (this.data.url) {
      this._createMedia(this.data.url, this.data.caption);
      this._hideLoader();
    } else {
      this._createUploader();
      this._hideLoader();
    }

    return this.wrapper;
  }

  _createUploader() {
    const uploaderWrapper = this._make('div', this.CSS.uploaderWrapper);
    
    // File input
    const fileInput = this._make('input', this.CSS.fileInput);
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this._uploadFile(file);
      }
    });

    // Upload button
    const uploadButton = this._make('div', this.CSS.uploadButton);
    uploadButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.15 13.628A7.749 7.749 0 0 0 10 18.5a7.74 7.74 0 0 0 6.305-3.242l-2.387-2.127A4.254 4.254 0 0 1 10.003 15a4.25 4.25 0 0 1-3.917-1.872l-2.936 2.5z"/>
        <path d="M14.549 8.58a4.062 4.062 0 0 1-1.411 2.001l2.945 2.5a7.759 7.759 0 0 0 1.066-6.46l-2.6 1.96z"/>
        <path d="M5.154 8.577l-2.6-1.961a7.76 7.76 0 0 0 1.066 6.461l2.945-2.5a4.064 4.064 0 0 1-1.411-2z"/>
        <path d="M10 6a4 4 0 0 1 .85.09l2.6-1.961A7.742 7.742 0 0 0 10 3.5a7.74 7.74 0 0 0-3.45.79l2.6 1.96c.28-.02.56-.04.85-.04z"/>
        <rect x="9" y="4" width="2" height="6" rx="1"/>
        <rect x="9" y="11" width="2" height="2" rx="1"/>
      </svg>
      Select Image or Video
    `;
    uploadButton.addEventListener('click', () => fileInput.click());

    // URL input
    const urlInput = this._make('input', this.CSS.urlInput);
    urlInput.placeholder = 'Paste image or video URL...';
    urlInput.addEventListener('paste', (e) => {
      setTimeout(() => {
        const url = e.target.value.trim();
        if (url) {
          this._loadByUrl(url);
        }
      }, 100);
    });

    const urlButton = this._make('button', this.CSS.urlButton);
    urlButton.textContent = 'Add by URL';
    urlButton.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        this._loadByUrl(url);
      }
    });

    uploaderWrapper.appendChild(fileInput);
    uploaderWrapper.appendChild(uploadButton);
    uploaderWrapper.appendChild(urlInput);
    uploaderWrapper.appendChild(urlButton);
    
    this.wrapper.appendChild(uploaderWrapper);
  }

  async _uploadFile(file) {
    this._showLoader();
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("result");
      console.log(result.file.url);
      
      const fileName = result.filename || result.fileName || file.name;
      const fileUrl = result.file.url;
      
      this.data.url = fileUrl;
      this.data.fileName = fileName;
      this.data.type = file.type.startsWith('video/') ? 'video' : 'image';
      
      this._createMedia(fileUrl);
      this._hideLoader();
    } catch (error) {
      console.error('Upload error:', error);
      this._hideLoader();
      this.api.notifier.show({
        message: `Upload failed: ${error.message}`,
        style: 'error'
      });
    }
  }

  _loadByUrl(url) {
    this._showLoader();
    
    this.data.url = url;
    this.data.type = this._getMediaTypeFromUrl(url);
    
    this._createMedia(url);
    this._hideLoader();
  }

  _getMediaTypeFromUrl(url) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
    const lowercaseUrl = url.toLowerCase();
    
    for (const ext of videoExtensions) {
      if (lowercaseUrl.includes(ext)) {
        return 'video';
      }
    }
    
    return 'image';
  }

  _createMedia(url, caption = '') {
    const mediaWrapper = this._make('div', this.CSS.mediaWrapper);
    let mediaElement;

    if (this.data.type === 'video') {
      mediaElement = this._make('video', this.CSS.media);
      mediaElement.src = url;
      mediaElement.controls = true;
      mediaElement.preload = 'metadata';
    } else {
      mediaElement = this._make('img', this.CSS.media);
      mediaElement.src = url;
      mediaElement.alt = caption || 'Media';
    }

    mediaElement.addEventListener('load', () => {
      this._hideLoader();
    });

    mediaElement.addEventListener('error', () => {
      this._hideLoader();
      this.api.notifier.show({
        message: 'Failed to load media',
        style: 'error'
      });
    });

    // Caption input
    const captionElement = this._make('div', this.CSS.caption, {
      contentEditable: !this.readOnly,
      innerHTML: this.data.caption || 'Enter a caption'
    });

    captionElement.addEventListener('blur', () => {
      this.data.caption = captionElement.innerHTML;
    });

    mediaWrapper.appendChild(mediaElement);
    mediaWrapper.appendChild(captionElement);

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(mediaWrapper);
  }

  _showLoader() {
    const loader = this.wrapper.querySelector(`.${this.CSS.loader}`);
    if (loader) {
      loader.style.display = 'block';
    }
  }

  _hideLoader() {
    const loader = this.wrapper.querySelector(`.${this.CSS.loader}`);
    if (loader) {
      loader.style.display = 'none';
    }
  }

  _make(tagName, classNames, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  renderSettings() {
    const wrapper = document.createElement('div');

    this.settings.forEach(tune => {
      const button = document.createElement('div');
      button.classList.add(this.CSS.settingsButton);
      button.innerHTML = tune.icon;
      button.classList.toggle(this.CSS.settingsButtonActive, this.data[tune.name]);

      button.addEventListener('click', () => {
        this._toggleTune(tune.name);
        button.classList.toggle(this.CSS.settingsButtonActive, this.data[tune.name]);
      });

      wrapper.appendChild(button);
    });

    return wrapper;
  }

  _toggleTune(tuneName) {
    this.data[tuneName] = !this.data[tuneName];
    this._applyTunings();
  }

  _applyTunings() {
    this.wrapper.classList.toggle(this.CSS.withBorder, this.data.withBorder);
    this.wrapper.classList.toggle(this.CSS.stretched, this.data.stretched);
    this.wrapper.classList.toggle(this.CSS.withBackground, this.data.withBackground);
  }

  save() {
    const caption = this.wrapper.querySelector(`.${this.CSS.caption}`);
    if (caption) {
      this.data.caption = caption.innerHTML;
    }
    return this.data;
  }

  validate(savedData) {
    return savedData.url.trim() !== '';
  }

  static get CSS() {
    return {
      baseClass: 'cdx-media',
      wrapper: 'cdx-media__wrapper',
      loader: 'cdx-media__loader',
      uploaderWrapper: 'cdx-media__uploader',
      uploadButton: 'cdx-media__upload-button',
      fileInput: 'cdx-media__file-input',
      urlInput: 'cdx-media__url-input',
      urlButton: 'cdx-media__url-button',
      mediaWrapper: 'cdx-media__media-wrapper',
      media: 'cdx-media__media',
      caption: 'cdx-media__caption',
      withBorder: 'cdx-media--with-border',
      stretched: 'cdx-media--stretched',
      withBackground: 'cdx-media--with-background',
      settingsButton: 'cdx-media__settings-button',
      settingsButtonActive: 'cdx-media__settings-button--active'
    };
  }

  get CSS() {
    return MediaTool.CSS;
  }

  static get pasteConfig() {
    return {
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff?|png|svg|webp)(\?[a-z0-9=]*)?$/i,
        video: /https?:\/\/\S+\.(mp4|webm|ogg|mov|avi|wmv)(\?[a-z0-9=]*)?$/i
      },
      files: {
        mimeTypes: ['image/*', 'video/*']
      }
    };
  }

  onPaste(event) {
    switch (event.type) {
      case 'tag': {
        const url = event.detail.data;
        this._loadByUrl(url);
        break;
      }
      case 'pattern': {
        const url = event.detail.data;
        this._loadByUrl(url);
        break;
      }
      case 'file': {
        const file = event.detail.file;
        this._uploadFile(file);
        break;
      }
    }
  }
}

// CSS styles - add this to your CSS file
const styles = `
.cdx-media {
  --bg-color: #eff2f5;
  --text-color: #707684;
  --border-color: #e8e8eb;
}

.cdx-media__wrapper {
  position: relative;
}

.cdx-media__loader {
  display: none;
  text-align: center;
  padding: 20px;
}

.cdx-media__loader::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-color);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cdx-media__uploader {
  background: var(--bg-color);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
}

.cdx-media__upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4A90E2;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.2s;
}

.cdx-media__upload-button:hover {
  background: #357ABD;
}

.cdx-media__url-input {
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
}

.cdx-media__url-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cdx-media__media-wrapper {
  text-align: center;
}

.cdx-media__media {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.cdx-media__caption {
  margin-top: 10px;
  padding: 8px;
  font-style: italic;
  color: var(--text-color);
  text-align: center;
  outline: none;
  min-height: 20px;
}

.cdx-media__caption:empty::before {
  content: 'Enter a caption';
  color: #ccc;
}

.cdx-media--with-border .cdx-media__media {
  border: 1px solid var(--border-color);
}

.cdx-media--stretched .cdx-media__media {
  width: 100%;
}

.cdx-media--with-background {
  background: var(--bg-color);
  padding: 15px;
  border-radius: 8px;
}

.cdx-media__settings-button {
  width: 26px;
  height: 26px;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.cdx-media__settings-button:hover {
  background-color: var(--bg-color);
}

.cdx-media__settings-button--active {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MediaTool;