// LoadingService.js
let showLoaderFn = () => {};
let hideLoaderFn = () => {};

export const registerLoader = (show, hide) => {
  showLoaderFn = show;
  hideLoaderFn = hide;
};

export const showLoader = () => showLoaderFn();
export const hideLoader = () => hideLoaderFn();
