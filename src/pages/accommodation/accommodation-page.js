import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import {
    CachedForm,
    FieldText,
    FieldSelect,
    FieldTextarea,
    FieldSwitch
} from 'matsumoto/src/components/form';
import { Loader, Stars, decorate } from 'matsumoto/src/simple';
import UI from 'stores/shuri-ui-store';
import EntitiesStore from 'stores/shuri-entities-store';
import LocationsStore from 'stores/shuri-locations-store';
import DialogModal from 'parts/dialog-modal';
import FieldTime from 'components/form/field-time';
import {
    createAccommodation,
    getAccommodation,
    removeAccommodation,
    updateAccommodation
} from 'providers/api';
import AgeRanges from './parts/age-ranges';
import Amenities from 'components/amenities';
import { agesReformat } from './parts/utils';
import Menu from 'parts/menu';
import { parseBackendErrors } from 'utils/error-utils';

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

const DEFAULT_ACCOMMODATION = {
    name: {
        [UI.editorLanguage]: ''
    },
    address: {
        [UI.editorLanguage]: ''
    },
    description: {
        en: {
            description: ''
        },
        ar: {
            description: ''
        },
        ru: {
            description: ''
        }
    },
    checkInTime: '',
    checkOutTime: '',
    contactInfo: {
        emails: [''],
        phones: [''],
        websites: ['']
    },
    type: '',
    amenities: {
        [UI.editorLanguage]: []
    },
    leisureAndSports: {
        [UI.editorLanguage]: []
    },
    additionalInfo: {
        [UI.editorLanguage]: ''
    },
    occupancyDefinition: {
        infant: {
            lowerBound: 0,
            upperBound: 3,
            enabled: true
        },
        child: {
            lowerBound: 4,
            upperBound: 11,
            enabled: true
        },
        teen: {
            lowerBound: 12,
            upperBound: 17,
            enabled: true
        },
        adult: {
            lowerBound: 18,
            enabled: true
        }
    },
    locationId: undefined,
    buildYear: '',
    floor: '',
    status: 'Inactive'
};

@observer
class AccommodationPage extends React.Component {
    @observable accommodation;
    @observable id = this.props.match.params.id;
    @observable redirectUrl = undefined;
    @observable isRemoveModalShown = false;
    @observable isRequestingApi = false;
    @observable formik;

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;

        if (prevId !== id) {
            this.id = id;
            this.loadData();
        }
    }

    @action
    loadData = () => {
        const id = this.id;
        LocationsStore.loadLocations();

        if (!id) {
            this.accommodation = DEFAULT_ACCOMMODATION;
        } else {
            getAccommodation({ urlParams: { id } }).then(this.getAccommodationSuccess);
        }
    }

    @action
    getAccommodationSuccess = (accommodation) => {
        accommodation.status = accommodation.status === 'Active';
        this.accommodation = accommodation;
        EntitiesStore.setAccommodation(accommodation);
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
        values.contactInfo.phones = [decorate.removeNonDigits(values.contactInfo.phone)];
        values.contactInfo.websites = [values.contactInfo.website];
        values.contactInfo.emails = [values.contactInfo.email];
        if (!values.description.ru.description) {
            values.description.ru.description = values.description.en.description;
        }
        if (!values.description.ar.description) {
            values.description.ar.description = values.description.en.description;
        }
        values.status = values.status ? 'Active' : 'Inactive';
        return {
            ...values,
            occupancyDefinition: agesReformat(values.occupancyDefinition)
        };
    }

    @action
    setRedirectUrl = () => {
        this.redirectUrl = '/';
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
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    onAccommodationRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodation({
            urlParams: {
                id: this.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onCreateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        const accommodation = this.reformatValues(values);
        this.setRequestingApiStatus();
        createAccommodation({ body: accommodation })
            .then(() => this.accommodationActionSuccess(accommodation), this.accommodationActionFail);
    }

    onUpdateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        const accommodation = this.reformatValues(values);
        this.setRequestingApiStatus();
        updateAccommodation({
            urlParams: {
                id: this.id
            },
            body: accommodation
        }).then(() => this.accommodationActionSuccess(accommodation), this.accommodationActionFail);
    }

    accommodationActionSuccess = (accommodation) => {
        this.unsetRequestingApiStatus();
        this.setRedirectUrl();
        EntitiesStore.setAccommodation(accommodation);
    }

    accommodationActionFail = (errorData) => {
        this.unsetRequestingApiStatus();
        const fieldsWithErrors = new Set();
        parseBackendErrors(errorData).forEach((error) => {
            if (!fieldsWithErrors.has(error.path)) {
                this.formik.setFieldError(error.path, error.message);
                fieldsWithErrors.add(error.path);
            }
        })
        this.forceUpdate();
    }

    @action
    renderForm = (formik) => {
        const { t } = this.props;
        this.formik = formik;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldSwitch formik={formik}
                                 id="status"
                                 label="Active Accommodation"
                    />
                </div>
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
                {/* ['en','ar','ru'].map((lang) => ( */}
                    <div className="row">
                        <FieldTextarea
                            formik={formik}
                            clearable
                            id="description.en.description"
                            label="Accommodation Description"
                            placeholder="Enter Accommodation Description"
                            required
                        />
                    </div>
                {/*))*/}
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
                            { value: 'NotRated', text: 'Unrated' },
                            { value: 'OneStar', text: <span>{t('Economy')}  <Stars count="1" /></span> },
                            { value: 'TwoStars', text: <span>{t('Budget')}   <Stars count="2" /></span> },
                            { value: 'ThreeStars', text: <span>{t('Standard')} <Stars count="3" /></span> },
                            { value: 'FourStars', text: <span>{t('Superior')} <Stars count="4" /></span> },
                            { value: 'FiveStars', text: <span>{t('Luxury')}   <Stars count="5" /></span> }
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
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="type"
                        label="Property Type"
                        placeholder="Choose property type"
                        options={[
                            { value: 'Any', text: 'Any' },
                            { value: 'Hotels', text: 'Hotels' },
                            { value: 'Apartments', text: 'Apartments' }
                        ]}
                    />

                    <FieldText
                        formik={formik}
                        clearable
                        id="floor"
                        label="Number of floors"
                        placeholder="Enter"
                    />
                    <FieldText
                        formik={formik}
                        clearable
                        id="buildYear"
                        label="Build year"
                        placeholder="Enter"
                    />
                </div>
                <div className="row">
                    <FieldTextarea
                        formik={formik}
                        clearable
                        id={`additionalInfo.${UI.editorLanguage}`}
                        label={'Additional Information'}
                        placeholder={'Additional Information'}
                    />
                </div>
                <div className="row">
                    <Amenities
                        formik={formik}
                        id={`amenities.${UI.editorLanguage}`}
                        label="Amenities"
                        placeholder="Add new amenity"
                    />
                </div>
                <div className="row">
                    <Amenities
                        formik={formik}
                        id={`leisureAndSports.${UI.editorLanguage}`}
                        label="Leisure And Sports"
                        placeholder="Add new Leisure or Sport"
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="rateOptions.singleAdultAndChildBookings"
                        label="Single Adult And Child Bookings Rate Option"
                        placeholder="Choose property type"
                        options={[
                            { value: 'ApplyAdultRate', text: 'Apply Adult Rate' },
                            { value: 'ApplyAdultAndChildRate', text: 'Apply Adult And Child Rate' }
                        ]}
                    />
                </div>

                <AgeRanges formik={formik} />

                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {this.id ?
                                    'Save changes' :
                                    'Create accommodation'
                                }
                            </button>
                        </div>
                    </div>
                    {this.id ?
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
        const isLoading = this.accommodation === undefined;

        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (
            <>
                <div className="hide">{JSON.stringify(LocationsStore.locations)}</div>
                <div className="settings block">
                    <Menu match={this.props.match} />
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                    {this.id ?
                                        `Edit ${this.accommodation.name[UI.editorLanguage]}` :
                                        t('Create new accommodation')
                                    }
                                    </span>
                                </h2>
                                <CachedForm
                                    initialValues={this.accommodation}
                                    valuesOverwrite={(form) => {
                                        if (!form.contactInfo) {
                                            form.contactInfo = [];
                                        }
                                        form.contactInfo.email = form.contactInfo.emails?.[0];
                                        form.contactInfo.phone = form.contactInfo.phones?.[0];
                                        form.contactInfo.website = form.contactInfo.websites?.[0];
                                        return form;
                                    }}
                                    onSubmit={this.id ? this.onUpdateSubmit : this.onCreateSubmit}
                                    render={this.renderForm}
                                    enableReinitialize
                                />
                            </>
                        }
                    </section>
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing accommodation')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.isRequestingApi ? this.onAccommodationRemove : undefined}
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
