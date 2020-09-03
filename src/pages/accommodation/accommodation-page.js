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
import FieldTime from 'components/form/field-time';
import {
    createAccommodation,
    getAccommodation,
    removeAccommodation,
    updateAccommodation
} from 'providers/api';

const CHECKOUT_TIME_OPTIONS = [
    { value: '10:00', text: '10:00' },
    { value: '11:00', text: '11:00' },
    { value: '12:00', text: '12:00' },
    { value: '13:00', text: '13:00' },
    { value: '14:00', text: '14:00' }
]

const CHECKIN_TIME_OPTIONS = [
    { value: '14:00', text: '14:00' },
    { value: '15:00', text: '15:00' },
    { value: '16:00', text: '16:00' }
]

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

        LocationsStore.loadLocations();
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
        if (!values.occupancyDefinition) {
            values.occupancyDefinition = {};
        }
        const agesReformat = (k1, k2, def) => {
            let value = parseInt(values.occupancyDefinition?.[k1]?.[k2]);
            if (value !== 0) {
                value = value || def;
            }
            if (!values.occupancyDefinition[k1]) {
                values.occupancyDefinition[k1] = {};
            }
            values.occupancyDefinition[k1][k2] = value;
        };
        agesReformat('infant', 'lowerBound', 0);
        agesReformat('infant', 'upperBound', 3);
        agesReformat('child', 'lowerBound', 4);
        agesReformat('child', 'upperBound', 11);
        agesReformat('adult', 'lowerBound', 12);
        agesReformat('adult', 'upperBound', 200);

        return values;
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
                    <FieldText
                        formik={formik}
                        clearable
                        id={`name.${UI.editorLanguage}`}
                        label={'Accommodation Name'}
                        placeholder={'Enter Accommodation Name'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id={`address.${UI.editorLanguage}`}
                        label={'Accommodation Address'}
                        placeholder={'Enter Accommodation Address'}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="coordinates.latitude"
                        label={'Latitude'}
                        placeholder={'Latitude'}
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="coordinates.longitude"
                        label={'Longitude'}
                        placeholder={'Longitude'}
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
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
                    <FieldSelect
                        formik={formik}
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
                    <FieldTime
                        formik={formik}
                        id="checkInTime"
                        label={'Check In Time'}
                        placeholder={'16:00'}
                        options={CHECKIN_TIME_OPTIONS}
                        required
                    />
                    <FieldTime
                        formik={formik}
                        id="checkOutTime"
                        label={'Check Out Time'}
                        placeholder={'11:00'}
                        options={CHECKOUT_TIME_OPTIONS}
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
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="occupancyDefinition.infant.lowerBound"
                        label="Occupancy Infant Age Lower Bound"
                        placeholder="0"
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="occupancyDefinition.infant.upperBound"
                        label="Occupancy Infant Age Upper Bound"
                        placeholder="3"
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="occupancyDefinition.child.lowerBound"
                        label="Occupancy Child Age Lower Bound"
                        placeholder="4"
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="occupancyDefinition.child.upperBound"
                        label="Occupancy Child Age Upper Bound"
                        placeholder="11"
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="occupancyDefinition.adult.lowerBound"
                        label="Occupancy Adult Age Lower Bound"
                        placeholder="12"
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id={'occupancyDefinition.adult.upperBound'}
                        label={'Occupancy Adult Age Upper Bound'}
                        placeholder={'200'}
                    />
                </div>
                <h3>PICTURES</h3>
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
