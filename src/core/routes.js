import React from 'react';
import { Switch } from 'react-router-dom';
import Route from 'matsumoto/src/core/misc/route';
import ErrorPage from 'matsumoto/src/pages/common/error';
import AccommodationsList from 'pages/accommodation/accommodations-list';
import AccommodationPage from 'pages/accommodation/accommodation-page';
import ContractsList from 'pages/contract/contracts-list';
import ContractPage from 'pages/contract/contract-page';
import RoomsList from 'pages/room/rooms-list';
import RoomPage from 'pages/room/room-page';
import SeasonsList from 'pages/seasons/seasons-list';
import Calendar from 'pages/calendar/calendar';

const Routes = () => (
    <Switch>
        <Route
            exact
            path="/"
            component={AccommodationsList}
        />
        <Route
            path={['/accommodation/:accommodationId/room/:id', '/accommodation/:accommodationId/room']}
            component={RoomPage}
        />
        <Route
            path="/accommodation/:accommodationId/rooms"
            component={RoomsList}
        />
        <Route
            path={['/accommodation/:id', '/accommodation']}
            component={AccommodationPage}
        />
        <Route
            path="/contracts"
            component={ContractsList}
        />
        <Route
            exact
            path={['/contract/:id', '/contract']}
            component={ContractPage}
        />
        <Route
            path="/contract/:id/seasons"
            component={SeasonsList}
        />
        <Route
            path="/contract/:id/calendar"
            component={Calendar}
        />
        <Route component={ErrorPage}/>
    </Switch>
);

export default Routes;
