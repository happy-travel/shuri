import React from 'react';
import { observer } from 'mobx-react';
import Accommodations from 'pages/accommodations';
import ContractsList from 'pages/list';

@observer
class ShuriMainPage extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Accommodations />
                <ContractsList />
            </React.Fragment>
        );
    }
}

export default ShuriMainPage;
