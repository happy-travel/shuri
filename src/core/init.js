import Authorize from 'core/auth/authorize';
import { isSignUpRoutes } from 'core/auth';
import { API } from 'core';
import { initInvite } from 'core/auth/invite';
import dropdownToggler from 'components/form/dropdown/toggler';

import UI from 'stores/ui-store';
import authStore from 'stores/auth-store';
import {
    getContractManager,
    getServiceSuppliers
} from 'providers/api'

export const initApplication = () => {
    initInvite();
    dropdownToggler();
};

export const initUser = () => {
    if (!isSignUpRoutes()) {
        getContractManager().then(
            (result) => {
                if (result?.email) {
                    authStore.setUser(result);
                }
                getServiceSuppliers().then(
                    (data) => authStore.setCounterpartyInfo(data)
                )
            },
            (response) => {
                if (response.status === 401 || response.status === 403) {
                    Authorize.signinRedirect();
                    return;
                }
                if (response.status === 400) {
                    window.location.href = window.location.origin + '/signup/manager';
                }
            }
        );
    }

    API.get({
        url: API.BASE_VERSION,
        success: (result) => {
            if (UI.currentAPIVersion !== result ||
                !UI.regions?.length ||
                !UI.currencies?.length
            ) {
                API.get({
                    url: API.BASE_REGIONS,
                    success: (result) => UI.setRegions(result)
                });
                API.get({
                    url: API.BASE_CURRENCIES,
                    success: (result) => UI.setCurrencies(result)
                });
                API.get({
                    url: API.OUR_COMPANY,
                    success: (result) => UI.setOurCompanyInfo(result)
                });
            }
            UI.setCurrentAPIVersion(result)
        }
    });
};
