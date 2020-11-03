import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import {
    CachedForm,
    FieldText,
    FieldSelect
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
        [UI.editorLanguage]: {
            description: ''
        }
    },
    checkInTime: '',
    checkOutTime: '',
    pictures: {
        [UI.editorLanguage]: [
            {
                source: '',
                caption: ''
            }
        ]
    },
    contactInfo: {
        email: '',
        phone: '',
        website: ''
    },
    type: '',
    amenities: {
        [UI.editorLanguage]: ['']
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
    locationId: undefined
};

@observer
class AccommodationPage extends React.Component {
    state = {
        accommodation: undefined,
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isRemoveModalShown: false,
        isRequestingApi: false
    };
    formik;

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;

        if (prevId !== id) {
            this.setState({ id }, this.loadData);
        }
    }

    loadData = () => {
        const { id } = this.state;
        LocationsStore.loadLocations();

        if (!id || EntitiesStore.hasAccommodation(id)) {
            this.setState({ accommodation: !id ? DEFAULT_ACCOMMODATION : EntitiesStore.getAccommodation(id) });
        } else {
            getAccommodation({ urlParams: { id } }).then(this.getAccommodationSuccess);
        }
    }

    getAccommodationSuccess = (accommodation) => {
        this.setState({ accommodation });
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
        if (values?.contactInfo?.phone) {
            values.contactInfo.phone = decorate.removeNonDigits(values.contactInfo.phone);
        }
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

    setPictures = (pictures) => {
        this.setState({
            accommodation: {
                ...this.formik.values,
                pictures: {
                    [UI.editorLanguage]: pictures
                }
            }
        });
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
        const accommodation = this.reformatValues(values);
        this.setRequestingApiStatus();
        createAccommodation({ body: accommodation })
            .then(() => this.accommodationActionSuccess(accommodation), this.accommodationActionFail);
    }

    onUpdateSubmit = (values) => {
        if (this.state.isRequestingApi) {
            return;
        }
        const accommodation = this.reformatValues(values);
        this.setRequestingApiStatus();
        updateAccommodation({
            urlParams: {
                id: this.state.id
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

    onAddPictureClick = () => {
        this.setPictures([
            ...this.state.accommodation.pictures[UI.editorLanguage],
            { source: '', caption: '' }
        ]);
    }

    onRemovePictureClick = (index) => {
        this.setPictures(
            this.state.accommodation.pictures[UI.editorLanguage].filter((picture, order) => order !== index)
        );
    }

    onChangePictureField = (event, index, field) => {
        const pictures = this.state.accommodation.pictures[UI.editorLanguage];
        pictures[index][field] = event.target.value;
        this.setPictures(pictures);
    }

    onClearPictureField = (index, field) => {
        const pictures = this.state.accommodation.pictures[UI.editorLanguage];
        pictures[index][field] = '';
        this.setPictures(pictures);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        this.formik = formik;
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
                        id="type"
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
        const isLoading = accommodation === undefined;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
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
                                    {id ?
                                        `Edit ${accommodation.name[UI.editorLanguage]}` :
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
                            </>
                        }
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
