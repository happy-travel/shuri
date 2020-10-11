import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import {
    getContract,
    getContractAccommodations
} from 'providers/api';
import Menu from 'parts/menu';
import UI from 'stores/shuri-ui-store';

@observer
class AvailabilityCalendar extends React.Component {
    @observable roomsList;
    @observable contract;
    contractId = this.props.match.params.contractId;

    constructor(props) {
        super(props);
        const requestParams = { urlParams: { id: this.contractId } };
        Promise.all([
            getContract(requestParams),
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, accommodationsList]) => {
        this.roomsList = new Map();
        this.contract = contract;
        accommodationsList.forEach((accommodation) => {
            accommodation.roomIds?.forEach((roomId) => {
                this.roomsList.set(String(roomId), `#${roomId}: ${accommodation.name[UI.editorLanguage]}`);
            });
        });
    }

    renderRoomsList = () => {
        return Array.from(this.roomsList.entries()).map(([roomId, roomName]) => {
            return (
                <div key={roomId} className="room-link-container">
                    <Link
                        to={`/contract/${this.contractId}/availability/room/${roomId}/calendar`}
                        className="button transparent-with-border"
                    >
                        <span className="room-link">{roomName}</span>
                    </Link>
                </div>
            );
        });
    }

    render() {
        const isLoading = this.contract === undefined;
        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match}/>
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                        {this.props.t('Availability Calendar - Choose a Room')}
                                    </span>
                                </h2>
                                {this.renderRoomsList()}
                            </>
                        }
                    </section>
                </div>
            </>
        );
    }
}

AvailabilityCalendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(AvailabilityCalendar);
