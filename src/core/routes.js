import React from 'react';
import propTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import Route from 'core/route';
import ErrorPage from 'matsumoto/src/pages/common/error';
import AccommodationsList from 'pages/accommodation/accommodations-list';
import AccommodationPage from 'pages/accommodation/accommodation-page';
import ContractsList from 'pages/contract/contracts-list';
import ContractPage from 'pages/contract/contract-page';
import RoomsList from 'pages/room/rooms-list';
import RoomPage from 'pages/room/room-page';
import SeasonsList from 'pages/seasons/seasons-list';
import Calendar from 'pages/calendar/calendar';

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
                title={t('Create New Room')}
                component={RoomPage}
            />
            <Route
                path="/accommodation/:accommodationId/room/:id"
                title={t('Edit Accommodation Room')}
                component={RoomPage}
            />
            <Route
                path="/accommodation/:accommodationId/rooms"
                title={t('Accommodation Rooms')}
                component={RoomsList}
            />
            <Route
                exact
                path="/accommodation"
                title={t('Create Accommodation')}
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
                title={t('Create Contract')}
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
                title={t('Edit Contracts Seasons')}
                component={SeasonsList}
            />
            <Route
                path="/contract/:id/calendar"
                title={t('Edit Contracts Calendar')}
                component={Calendar}
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
