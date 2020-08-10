import React from 'react';
import { Switch } from 'react-router-dom';
import Route from 'matsumoto/src/core/misc/route';
import ErrorPage from 'matsumoto/src/pages/common/error';
import MainPage from 'pages/main-page/main-page';
import AccommodationsList from 'pages/accomodations-list/accommodations-list';
import ContractsList from 'pages/contracts-list/contracts-list';
import ContractPage from 'pages/contract-page/contract-page';

const Routes = () => (
    <Switch>
        <Route exact path="/" component={MainPage} />
        <Route exact path="/accommodations" component={AccommodationsList} />
        <Route exact path="/contracts" component={ContractsList} />
        <Route exact path={['/contract/:id', '/contract']} component={ContractPage} />
        <Route component={ErrorPage} />
    </Switch>
);

export default Routes;
