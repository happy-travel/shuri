import settings from 'settings';
import apiPromise from 'lib/api';
import UI from 'stores/shuri-ui-store';

const LANGUAGE = UI.editorLanguage || settings.default_culture;
const API_BASE_PATH = `${settings.dc_url}${LANGUAGE}/api/1.0`;
const CONTRACTS_PATH = '/management/contracts';
const ACCOMMODATIONS_PATH = '/management/contracts/accommodations';

function getAccommodations() {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}`
    });
}

function createAccommodation({ body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}`,
        method: 'POST',
        body
    });
}

function getAccommodation({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.id}`
    });
}

function updateAccommodation({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.id}`,
        method: 'PUT',
        body
    });
}

function removeAccommodation({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.id}`,
        method: 'DELETE'
    });
}

function getContracts() {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}`
    });
}

function createContract({ body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}`,
        method: 'POST',
        body
    });
}

function getContract({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}`
    });
}

function updateContract({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}`,
        method: 'PUT',
        body
    });
}

function removeContract({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}`,
        method: 'DELETE'
    });
}

function getAccommodationRooms({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms`
    });
}

function createAccommodationRoom({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms`,
        method: 'POST',
        body
    });
}

function removeAccommodationRooms({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms`,
        method: 'DELETE',
        body
    });
}

function getAccommodationRoom({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms/${urlParams.roomId}`
    });
}

function updateAccommodationRoom({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms/${urlParams.roomId}`,
        method: 'PUT',
        body
    });
}

function removeAccommodationRoom({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/rooms/${urlParams.roomId}`,
        method: 'DELETE'
    });
}

function getSeasons({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/seasons`
    })
}

function createSeason({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/seasons`,
        method: 'POST',
        body
    })
}

function removeSeason({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.contractId}/seasons/${urlParams.id}`,
        method: 'DELETE'
    })
}

function getAccommodationLocations() {
    return apiPromise({
        url: `${API_BASE_PATH}/management/locations`
    })
}

function getSeasonRanges({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/seasons/ranges`
    })
}

function updateSeasonRanges({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/seasons/ranges`,
        method: 'POST',
        body
    })
}

function getContractAccommodations({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/accommodations`
    });
}

function getRates({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/rates`
    })
}

function createRate({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/rates`,
        method: 'POST',
        body
    })
}

function removeRate({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/rates`,
        method: 'DELETE',
        body
    })
}

function getAvailabilityRestrictions({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.contractId}` +
            `/availability-restrictions?roomId=${urlParams.roomId}`
    });
}

function updateAvailabilityRestrictions({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/availability-restrictions`,
        method: 'POST',
        body
    });
}

function getCancellations({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/cancellation-policies`,
        method: 'GET'
    });
}

function createCancellation({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/cancellation-policies`,
        method: 'POST',
        body
    });
}

function removeCancellation({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/cancellation-policies`,
        method: 'DELETE',
        body
    });
}

function getAllocationRequirements({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/allocation-requirements`
    });
}

function createAllocationRequirement({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/allocation-requirements`,
        method: 'POST',
        body
    });
}

function removeAllocationRequirement({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/allocation-requirements`,
        method: 'DELETE',
        body
    });
}

function getPromotionalOffers({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/promotional-offers`
    });
}

function createPromotionalOffer({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/promotional-offers`,
        method: 'POST',
        body
    });
}

function removePromotionalOffer({ urlParams, body }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.id}/promotional-offers`,
        method: 'DELETE',
        body
    });
}

function getContractManager() {
    return apiPromise({
        url: `${API_BASE_PATH}/management/manager`,
        method: 'GET'
    });
}

function registerContractManager({ body }) {
    return apiPromise({
        url: `${API_BASE_PATH}/management/manager`,
        method: 'POST',
        body
    });
}

function getAccommodationPhotos({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.id}/photos`
    });
}

function removeAccommodationPhoto({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${urlParams.accommodationId}/photo/${urlParams.photoId}`,
        method: 'DELETE'
    });
}

function getContractDocument({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.contractId}/file/${urlParams.documentId}`
    });
}

function removeContractDocument({ urlParams }) {
    return apiPromise({
        url: `${API_BASE_PATH}${CONTRACTS_PATH}/${urlParams.contractId}/file/${urlParams.documentId}`,
        method: 'DELETE'
    });
}

function getAllAmenities() {
    return apiPromise({
        url: `${API_BASE_PATH}/amenities`,
        method: 'GET'
    });
}

export {
    API_BASE_PATH,
    ACCOMMODATIONS_PATH,
    CONTRACTS_PATH,
    getAccommodations,
    createAccommodation,
    getAccommodation,
    updateAccommodation,
    removeAccommodation,
    getContracts,
    createContract,
    getContract,
    updateContract,
    removeContract,
    getAccommodationRooms,
    createAccommodationRoom,
    removeAccommodationRooms,
    getAccommodationRoom,
    updateAccommodationRoom,
    removeAccommodationRoom,
    getSeasons,
    createSeason,
    removeSeason,
    getAccommodationLocations,
    getSeasonRanges,
    updateSeasonRanges,
    getContractAccommodations,
    getRates,
    createRate,
    removeRate,
    getAvailabilityRestrictions,
    updateAvailabilityRestrictions,
    getCancellations,
    createCancellation,
    removeCancellation,
    getAllocationRequirements,
    createAllocationRequirement,
    removeAllocationRequirement,
    getPromotionalOffers,
    createPromotionalOffer,
    removePromotionalOffer,
    getContractManager,
    registerContractManager,
    getAccommodationPhotos,
    removeAccommodationPhoto,
    getContractDocument,
    removeContractDocument,
    getAllAmenities
};
