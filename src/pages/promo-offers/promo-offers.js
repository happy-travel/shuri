import React from 'react';
import { withTranslation } from 'react-i18next';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import OfferActionModal from 'pages/promo-offers/promo-action-modal';
import Menu from 'parts/menu';
import EntitiesStore from 'stores/shuri-entities-store';
import UI from 'stores/shuri-ui-store';
import {
    getContract,
    getContractAccommodations,
    getPromotionalOffers,
    removePromotionalOffer,
    createPromotionalOffer
} from 'providers/api';
import { formatDate, formatDateToString } from 'utils/date-utils';

@observer
class PromoOffers extends React.Component {
    contractId = this.props.match.params.id;
    @observable contract;
    @observable promoOffers;
    @observable accommodationsList;
    @observable offerStub;
    @observable activeOffer;
    @observable isRequestingApi = false;

    @computed
    get roomsNames() {
        const roomsNames = new Map();
        this.accommodationsList.forEach((accommodation) => {
            accommodation.roomIds?.forEach((roomId) => {
                roomsNames.set(roomId, `${accommodation.name[UI.editorLanguage]} (room #${roomId})`);
            });
        });
        return roomsNames;
    }

    @computed
    get roomsOptions() {
        return Array.from(this.roomsNames.entries()).map(([id, name]) => ({
            value: id,
            text: name
        }));
    }

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        const requestParams = { urlParams: { id: this.contractId } };
        Promise.all([
            getContract(requestParams),
            getPromotionalOffers(requestParams),
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, promoOffers, accommodationsList]) => {
        this.contract = contract;
        this.promoOffers = promoOffers;
        this.accommodationsList = accommodationsList;
        EntitiesStore.setContract(contract);
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    @action
    setOfferStub = (stub) => {
        this.offerStub = stub;
    }

    @action
    setActiveOffer = (offer) => {
        this.activeOffer = offer;
    }

    @action
    hideModal = () => {
        this.offerStub = undefined;
        this.activeOffer = undefined;
    }

    reformatValues(values) {
        const bookBy = values.bookBy;
        delete values.bookBy;
        return {
            ...values,
            contractId: Number(this.contractId),
            discountPercent: Number(values.discountPercent),
            validFrom: formatDate(values.validFrom),
            validTo: formatDate(values.validTo),
            bookByDate: formatDate(bookBy)
        }
    }

    onRemoveClick = () => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        removePromotionalOffer({
            urlParams: { id: this.contractId },
            body: [this.activeOffer.id]
        }).then(this.onRemoveClickSuccess).finally(this.onRemoveClickFinally);
    }

    @action
    onRemoveClickSuccess = () => {
        this.promoOffers = this.promoOffers.filter((offer) => offer.id !== this.activeOffer.id);
    }

    onRemoveClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    @action
    onCreateClick = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        createPromotionalOffer({
            urlParams: {
                id: this.contractId
            },
            body: [this.reformatValues(values)]
        }).then(this.onCreateClickSuccess).finally(this.onCreateClickFinally);
    }

    onCreateClickSuccess = ([offer]) => {
        this.promoOffers.push(offer);
        this.hideModal();
    }

    onCreateClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    renderPromoOffer = (offer) => {
        const { t } = this.props;
        return (
            <div className="rate-info" onClick={() => this.setActiveOffer(offer)}>
                <div>
                    {t('Book by') + ` ${formatDateToString(offer.bookBy)}`}
                </div>
                <div>
                    {t('Discount is') + ` ${offer.discountPercent}%`}
                </div>
            </div>
        );
    }

    renderRoomPromoOffers = (roomId) => {
        const offers = this.promoOffers.filter((offer) => offer.roomId === roomId);
        return (
            <div key={roomId} className="room-info no-margin">
                <div className="room-name">
                    {this.roomsNames.get(roomId)}
                </div>
                <div className="rates-container">
                    {offers ? offers.map(this.renderPromoOffer) : null}
                    <div
                        className="add-icon-container"
                        onClick={() => this.setOfferStub({ roomId })}
                    >
                        <span className="icon icon-add" />
                    </div>
                </div>
            </div>
        )
    }

    renderRooms = () => {
        const roomIds = Array.from(this.roomsNames.keys());
        return (
            <div className="season-container no-border">
                <div className="season-info">
                    {roomIds.map(this.renderRoomPromoOffers)}
                </div>
            </div>
        );
    }

    render() {
        const isLoading = this.contract === undefined;

        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match} />
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                        {this.props.t('Promotional Offers')}
                                    </span>
                                </h2>
                                {this.renderRooms()}
                            </>
                        }
                    </section>
                </div>
                {this.activeOffer || this.offerStub ?
                    <OfferActionModal
                        offer={this.activeOffer}
                        offerStub={this.offerStub}
                        roomsOptions={this.roomsOptions}
                        onClose={this.hideModal}
                        action={this.activeOffer ? this.onRemoveClick : this.onCreateClick}
                    /> :
                    null
                }
            </>
        );
    }
}

PromoOffers.propTypes = {
    t: propTypes.func,
    match: propTypes.object
}

export default withTranslation()(PromoOffers);
