import settings from 'settings';

const dc = `${settings.dc_url}/api/1.0`;

const apiMethods = {
    getAccommodationById: (accommodationId) => `${dc}/management/contracts/accommodations/${accommodationId}`,

    contracts: () => `${dc}/management/contracts`,
    contractById: (contractId) => `${dc}/management/contracts/${contractId}`,
};

export default apiMethods;
