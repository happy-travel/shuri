import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import {
    CachedForm,
    FieldText,
    FieldSelect
} from 'matsumoto/src/components/form';
import { Loader, Stars } from 'matsumoto/src/simple';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import UI from 'stores/shuri-ui-store';
import LocationsStore from 'stores/shuri-locations-store';
import DialogModal from 'parts/dialog-modal';
import {
    createAccommodation,
    getAccommodation,
    removeAccommodation,
    updateAccommodation
} from 'providers/api';
import AgeRanges from './parts/age-ranges';
import { agesReformat } from './parts/utils';

@observer
class AccommodationPage extends React.Component {
    state = {
        accommodation: undefined,
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isRemoveModalShown: false,
        isRequestingApi: false
    };

    componentDidMount() {
        if (!this.state.id) {
            this.setState({ accommodation: {} });
            return;
        }

        getAccommodation({
            urlParams: {
                id: this.state.id
            }
        }).then(this.getAccommodationSuccess);
    }

    getAccommodationSuccess = (accommodation) => {
        this.setState({ accommodation });
    }

    getLocationOptions = () => {
        return LocationsStore.locations.map((location) => {
            const text = location.zone ?
                `${location.country} - ${location.locality} (zone: ${location.zone})` :
                `${location.country} - ${location.locality}`;
            return {
                value: location.id,
                text
            };
        });
    }

    reformatValues = (values) => {
        return {
            ...values,
            occupancyDefinition: agesReformat(values.occupancyDefinition)
        };
    }

    setRedirectUrl = () => {
        this.setState({ redirectUrl: '/' });
    }

    setRequestingApiStatus = () => {
        this.setState({ isRequestingApi: true });
    }

    unsetRequestingApiStatus = () => {
        this.setState({ isRequestingApi: false });
    }

    onOpenRemoveModal = () => {
        this.setState({
            isRemoveModalShown: true
        });
    }

    onCloseRemoveModal = () => {
        this.setState({
            isRemoveModalShown: false
        });
    }

    onAccommodationRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodation({
            urlParams: {
                id: this.state.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onCreateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        createAccommodation({ body: this.reformatValues(values) })
            .then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onUpdateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        updateAccommodation({
            urlParams: {
                id: this.state.id
            },
            body: this.reformatValues(values)
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        const { id } = this.state;
        const text = id ?
            this.state.accommodation.name[UI.editorLanguage] || `Accommodation #${id}`:
            t('Create accommodation');

        return (
            <Breadcrumbs
                backLink={'/'}
                items={[
                    {
                        text: t('Accommodations'),
                        link: '/'
                    }, {
                        text
                    }
                ]}
            />
        );
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        return (
            <div className="form app-settings">
                { /* TODO: pictures */ }
                { /* TODO: amenities */ }
                <div className="row">
                    <FieldText formik={formik}
                        clearable
                        id={`name.${UI.editorLanguage}`}
                        label={'Accommodation Name'}
                        placeholder={'Enter Accommodation Name'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik}
                        clearable
                        id={`address.${UI.editorLanguage}`}
                        label={'Accommodation Address'}
                        placeholder={'Enter Accommodation Address'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik}
                        clearable
                        id="coordinates.latitude"
                        label={'Latitude'}
                        placeholder={'Latitude'}
                    />
                    <FieldText formik={formik}
                        clearable
                        id="coordinates.longitude"
                        label={'Longitude'}
                        placeholder={'Longitude'}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik}
                        clearable
                        id={`description.${UI.editorLanguage}.description`}
                        label={'Accommodation Description'}
                        placeholder={'Enter Accommodation Description'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="locationId"
                        label={t('Locations')}
                        options={this.getLocationOptions()}
                    />
                </div>
                <div className="row">
                    <FieldSelect formik={formik}
                         id="rating"
                         label={t('Star Rating')}
                         options={[
                             { value: 'notRated', text: 'Unrated' },
                             { value: 'oneStar', text: <span>{t('Economy')}  <Stars count="1" /></span> },
                             { value: 'twoStars', text: <span>{t('Budget')}   <Stars count="2" /></span> },
                             { value: 'threeStars', text: <span>{t('Standard')} <Stars count="3" /></span> },
                             { value: 'fourStars', text: <span>{t('Superior')} <Stars count="4" /></span> },
                             { value: 'fiveStars', text: <span>{t('Luxury')}   <Stars count="5" /></span> }
                         ]}
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="checkInTime"
                        label={'Check In Time'}
                        placeholder={'16:00'}
                        required
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="checkOutTime"
                        label={'Check Out Time'}
                        placeholder={'11:00'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="contactInfo.email"
                        label={'Contact Email'}
                        placeholder={'Enter Contact Email'}
                        required
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="contactInfo.phone"
                        label={'Contact Phone'}
                        placeholder={'Enter Contact Phone'}
                        required
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="contactInfo.website"
                        label={'Website'}
                        placeholder={'Enter Website'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="propertyType"
                        label="Property Type"
                        placeholder="Choose property type"
                        options={[
                            { value: 'any', text: 'Any' },
                            { value: 'hotels', text: 'Hotels' },
                            { value: 'apartments', text: 'Apartments' }
                        ]}
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id={`additionalInfo.${UI.editorLanguage}`}
                        label={'Additional Information'}
                        placeholder={'Additional Information'}
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id={`amenities.${UI.editorLanguage}.0`}
                        label={'Amenities'}
                        placeholder={'Amenities'}
                        required
                    />
                </div>

                <AgeRanges formik={formik} />

                <h3>Pictures</h3>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id={`pictures.${UI.editorLanguage}.0.source`}
                        label={'Picture source link'}
                        placeholder={'https://domain/image.jpg'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id={`pictures.${UI.editorLanguage}.0.caption`}
                        label={'Picture caption'}
                        placeholder={'Enter picture text description'}
                        required
                    />
                </div>

                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {id ?
                                    'Save changes' :
                                    'Create accommodation'
                                }
                            </button>
                        </div>
                    </div>
                    {id ?
                        <button
                            type="button"
                            onClick={this.onOpenRemoveModal}
                            className="button gray remove-button"
                        >
                            {t('Remove accommodation')}
                        </button> :
                        null
                    }
                </div>
            </div>
        );
    }

    render() {
        const { t } = this.props;
        const { redirectUrl, id, accommodation } = this.state;

        if (accommodation === undefined) {
            return <Loader />;
        }

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="hide">{JSON.stringify(LocationsStore.locations)}</div>
                <div className="settings block">
                    <section>
                        {this.renderBreadcrumbs()}
                        <h2>
                            {id ?
                                <div>
                                    <Link to={`/accommodation/${id}/rooms`}>
                                        <button className="button go-to-rooms">
                                            {`Rooms management (${accommodation?.roomIds?.length || 0})`}
                                        </button>
                                    </Link>
                                </div> :
                                null
                            }
                            <span className="brand">
                                {id ?
                                    `Edit accommodation #${id}` :
                                    t('Create new accommodation')
                                }
                            </span>
                        </h2>
                        <CachedForm
                            initialValues={accommodation}
                            onSubmit={id ? this.onUpdateSubmit : this.onCreateSubmit}
                            render={this.renderForm}
                            enableReinitialize
                        />
                    </section>
                </div>
                {this.state.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing accommodation')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.state.isRequestingApi ? this.onAccommodationRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

AccommodationPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(AccommodationPage);
