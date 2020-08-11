import settings from 'settings';

const apiBasePath = `${settings.dc_url}/api/1.0`;

const apiMethods = {
    accommodationById: (accommodationId) => `${apiBasePath}/management/contracts/accommodations/${accommodationId}`,
    accommodationsList: () => `${apiBasePath}/management/contracts/accommodations`,
    contractsList: () => `${apiBasePath}/management/contracts`,
    contractById: (contractId) => `${apiBasePath}/management/contracts/${contractId}`,
    roomsList: (accommodationId) => `${apiBasePath}/management/contracts/accommodations/${accommodationId}/rooms`,
};

export default apiMethods;
