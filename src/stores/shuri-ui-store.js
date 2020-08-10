import { observable } from 'mobx';

class UIStore {
    @observable editorLanguage = 'en';
}

export default new UIStore();
