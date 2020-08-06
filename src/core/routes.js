import React from 'react';
import { Switch } from 'react-router-dom';
import Route from 'matsumoto/src/core/misc/route';
import errorPage from 'matsumoto/src/pages/common/error';
import mainPage from 'pages/main';
import contractPage from 'pages/contract-page';

const Routes = () => (
    <Switch>
        <Route exact path="/" component={mainPage} />
        <Route
            exact
            path={[
                "/contract/:id",
                "/contract"
            ]}
            component={contractPage}
        />
        <Route component={errorPage} />
    </Switch>
);

export default Routes;
