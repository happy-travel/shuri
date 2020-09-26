import { action, observable } from 'mobx';
import { getSeasons } from '../providers/api';

class SeasonsStore {
    @observable seasons = [];

    loadSeasons = (params) => {
        return getSeasons(params).then(this.setSeasons);
    }

    @action
    setSeasons = (seasons) => {
        this.seasons = seasons;
    }
}

export default new SeasonsStore();
