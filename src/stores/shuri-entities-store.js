import { action, observable } from 'mobx';

class EntitiesStore {
    @observable entities = {
        contracts: new Map(),
        accommodations: new Map(),
        rooms: new Map()
    };

    @action
    setContract = (contract) => {
        this.entities.contracts.set(String(contract.id), contract);
    }

    getContract = (id) => {
        return this.entities.contracts.get(String(id));
    }

    hasContract = (id) => {
        return this.entities.contracts.has(String(id));
    }

    @action
    setAccommodation = (accommodation) => {
        this.entities.accommodations.set(String(accommodation.id), accommodation);
    }

    getAccommodation = (id) => {
        return this.entities.accommodations.get(String(id));
    }

    hasAccommodation = (id) => {
        return this.entities.accommodations.has(String(id));
    }

    @action
    setRoom = (accommodationId, room) => {
        const accommodationIdString = String(accommodationId);
        const roomIdString = String(room.id);
        if (this.entities.rooms.has(accommodationIdString)) {
            this.entities.rooms.get(accommodationIdString).set(roomIdString, room);
        } else {
            this.entities.rooms.set(accommodationIdString, new Map([[roomIdString, room]]));
        }
    }

    getRoom = (accommodationId, roomId) => {
        return this.entities.rooms.get(String(accommodationId)).get(String(roomId));
    }

    hasRoom = (accommodationId, roomId) => {
        const accommodationIdString = String(accommodationId);
        return this.entities.rooms.has(accommodationIdString) &&
            this.entities.rooms.get(accommodationIdString).has(String(roomId));
    }
}

export default new EntitiesStore();
