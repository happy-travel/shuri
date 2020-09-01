import { action, observable } from 'mobx';
import { getAccommodationLocations } from '../providers/api';
import { Authorized } from 'matsumoto/src/core/auth';

class LocationsStore {
    @observable locations = [];

    constructor() {
        if (Authorized()) {
            getAccommodationLocations().then(this.setLocations);
        }
    }

    @action
    setLocations = (locations) => {
        this.locations = [...this.locations, ...locations];
    }
}

export default new LocationsStore();
