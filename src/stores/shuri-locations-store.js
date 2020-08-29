import { action, observable } from 'mobx';
import { getAccommodationLocations } from '../providers/api';

class LocationsStore {
    @observable locations = [];

    constructor() {
        getAccommodationLocations().then(this.setLocations);
    }

    @action
    setLocations = (locations) => {
        this.locations = [...this.locations, ...locations];
    }
}

export default new LocationsStore();
