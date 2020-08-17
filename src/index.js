import React from 'react';
import { render } from 'react-dom';
import { windowLocalStorage } from 'matsumoto/src/core/misc/window-storage';
import { initApplication } from 'matsumoto/src/core/init';
import App from 'core/app';

const dir = windowLocalStorage.get('direction');
if (['ltr', 'rtl'].includes(dir)) {
    document.getElementsByTagName('html')[0].setAttribute('dir', dir);
}

window.onload = function() {
    render(<App />, document.getElementById('app'));
}

initApplication();
