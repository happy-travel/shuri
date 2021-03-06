import React from 'react';
import propTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import Route from 'matsumoto/src/core/misc/route';
import ErrorPage from 'matsumoto/src/pages/common/error';
import AccommodationsList from 'pages/accommodation/accommodations-list';
import AccommodationPage from 'pages/accommodation/accommodation-page';
import ContractsList from 'pages/contract/contracts-list';
import ContractPage from 'pages/contract/contract-page';
import RoomsList from 'pages/room/rooms-list';
import RoomPage from 'pages/room/room-page';
import Calendar from 'pages/calendar/calendar';
import SeasonsRates from 'pages/seasons-rates/seasons-rates';
import AvailabilityCalendar from 'pages/availability/availability-calendar'
import RoomAvailabilityCalendar from 'pages/availability/room-availability-calendar';
import Cancellations from 'pages/cancellations/cancellations';
import AllocationRequirements from 'pages/allocation-requirements/allocation-requirements';
import PromoOffers from 'pages/promo-offers/promo-offers';
import RegistrationManager from 'pages/account/registration-manager';
import RegistrationServiceSupplier from 'pages/account/registration-service-supplier';
import AccommodationPhotosPage from 'pages/accommodation-photos/accommodation-photos-page';
import CommonSettings from 'pages/settings/invitation-send';
import AcceptInvite from 'matsumoto/src/pages/account/accept-invite';

const Routes = (props) => {
    const { t } = props;
    return (
        <Switch>
            <Route
                exact
                path="/"
                title={t('Accommodations')}
                component={AccommodationsList}
            />
            <Route
                exact
                path="/accommodation/:accommodationId/room"
                title={t('Room Creation')}
                component={RoomPage}
            />
            <Route
                path="/accommodation/:accommodationId/room/:id"
                title={t('Edit Room')}
                component={RoomPage}
            />
            <Route
                path="/accommodation/:accommodationId/rooms"
                title={t('Rooms')}
                component={RoomsList}
            />
            <Route
                path="/accommodation/:id/photos"
                title={t('Accommodation Photos')}
                component={AccommodationPhotosPage}
            />
            <Route
                exact
                path="/accommodation"
                title={t('Accommodation Creation')}
                component={AccommodationPage}
            />
            <Route
                path="/accommodation/:id"
                title={t('Edit Accommodation')}
                component={AccommodationPage}
            />
            <Route
                path="/contracts"
                title={t('Contracts')}
                component={ContractsList}
            />
            <Route
                exact
                path="/contract"
                title={t('Contract Creation')}
                component={ContractPage}
            />
            <Route
                exact
                path="/contract/:id"
                title={t('Edit Contract')}
                component={ContractPage}
            />
            <Route
                path="/contract/:id/seasons"
                title={t('Season Calendar')}
                component={Calendar}
            />
            <Route
                path="/contract/:id/rates"
                title={t('Seasons Rates')}
                component={SeasonsRates}
            />
            <Route
                path="/contract/:contractId/availability/room/:roomId/calendar"
                title={t('Availability Calendar')}
                component={RoomAvailabilityCalendar}
            />
            <Route
                path="/contract/:contractId/availability/rooms"
                title={t('Availability Calendar')}
                component={AvailabilityCalendar}
            />
            <Route
                path="/contract/:id/cancellations"
                title={t('Cancellation Policies')}
                component={Cancellations}
            />
            <Route
                path="/contract/:id/allocations"
                title={t('Allocation Requirements')}
                component={AllocationRequirements}
            />
            <Route
                path="/contract/:id/promo-offers"
                title={t('Promotional Offers')}
                component={PromoOffers}
            />
            <Route
                exact
                path="/signup/manager"
                title="Sign Up"
                component={RegistrationManager}
            />
            <Route
                exact
                path="/signup/service-supplier"
                title="Sign Up"
                component={RegistrationServiceSupplier}
            />
            <Route
                path="/signup/invite/:email/:code"
                title="Sign Up"
                component={AcceptInvite}
            />
            <Route
                exact
                path="/settings"
                title="Settings"
                component={CommonSettings}
            />
            <Route
                title={t('Page Not Found')}
                component={ErrorPage}
            />
        </Switch>
    );
}

Routes.propTypes = {
    t: propTypes.func
}

export default withTranslation()(Routes);
