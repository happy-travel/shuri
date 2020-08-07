import settings from 'settings';

const apiBasePath = `${settings.dc_url}/api/1.0`;

const apiMethods = {
    getAccommodationById: (accommodationId) => `${apiBasePath}/management/contracts/accommodations/${accommodationId}`,
    accommodationsList: () => `${apiBasePath}/accommodations/availabilities`,
    contractsList: () => `${apiBasePath}/management/contracts`,
    contractById: (contractId) => `${apiBasePath}/management/contracts/${contractId}`,
};

export default apiMethods;
