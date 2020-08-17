import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';
import {
    CachedForm,
    FieldText,
    FieldSelect
} from 'matsumoto/src/components/form';
import { Stars } from 'matsumoto/src/simple';
import Breadcrumbs from 'components/breadcrumbs';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import UI from 'stores/shuri-ui-store';
import DialogModal from '../../parts/dialog-modal';

class AccommodationPage extends React.Component {
    state = {
        accommodation: {},
        id: this.props.match.params.id,
        redirectUrl: undefined,
        isRemoveModalShown: false
    };

    componentDidMount() {
        if (!this.state.id)
            return;

        API.get({
            url: apiMethods.accommodationById(this.state.id),
            success: (result) => {
                this.setState({ accommodation: result });
            }
        })
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
        this.setState({ isRequestingApi: true });
        API.delete({
            url: apiMethods.accommodationById(this.state.id),
            success: () => {
                this.setState({ redirectUrl: '/' });
            },
            after: () => {
                this.setState({ isRequestingApi: false })
            }
        })
    }

    reformatValues = (values) => {
        values.description = values.textualDescription;

        if (!values.occupancyDefinition) values.occupancyDefinition = {};
        const agesReformat = (k1, k2, def) => {
            let value = parseInt(values.occupancyDefinition?.[k1]?.[k2]);
            if (value !== 0) value = value || def;
            if (!values.occupancyDefinition[k1]) values.occupancyDefinition[k1] = {};
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

    submit = (values) => {
        const method = this.state.id ? "put" : "post",
              url = this.state.id ? apiMethods.accommodationById(this.state.id) : apiMethods.accommodationsList();

        API[method]({
            url: url,
            body: this.reformatValues(values),
            success: (result) => {
                this.setState({ redirectUrl: '/' });
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
        return (
            <div className="form app-settings">
                { /* TODO: pictures */ }
                { /* TODO: amenities */ }
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`name.${UI.editorLanguage}`}
                        label={"Accommodation Name"}
                        placeholder={"Enter Accommodation Name"}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`address.${UI.editorLanguage}`}
                        label={"Accommodation Address"}
                        placeholder={"Enter Accommodation Address"}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id="coordinates.latitude"
                        label={"Latitude"}
                        placeholder={"Latitude"}
                    />
                    <FieldText formik={formik} clearable
                        id="coordinates.longitude"
                        label={"Longitude"}
                        placeholder={"Longitude"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`textualDescription.${UI.editorLanguage}.description`}
                        label={"Accommodation Description"}
                        placeholder={"Enter Accommodation Description"}
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect formik={formik}
                         id="rating"
                         label={t("Star Rating")}
                         options={[
                             {value: "notRated",   text: "Unrated"},
                             {value: "oneStar",    text: <span>{t("Economy")}  <Stars count="1" /></span>},
                             {value: "twoStars",   text: <span>{t("Budget")}   <Stars count="2" /></span>},
                             {value: "threeStars", text: <span>{t("Standard")} <Stars count="3" /></span>},
                             {value: "fourStars",  text: <span>{t("Superior")} <Stars count="4" /></span>},
                             {value: "fiveStars",  text: <span>{t("Luxury")}   <Stars count="5" /></span>},
                         ]}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                         id="checkInTime"
                         label={"Check In Time"}
                         placeholder={"16:00"}
                         required
                    />
                    <FieldText formik={formik} clearable
                         id="checkOutTime"
                         label={"Check Out Time"}
                         placeholder={"11:00"}
                         required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id="contactInfo.email"
                               label={"Contact Email"}
                               placeholder={"Enter Contact Email"}
                    />
                    <FieldText formik={formik} clearable
                               id="contactInfo.phone"
                               label={"Contact Phone"}
                               placeholder={"Enter Contact Phone"}
                               required
                    />
                    <FieldText formik={formik} clearable
                               id="contactInfo.website"
                               label={"Website"}
                               placeholder={"Enter Website"}
                               required
                    />
                </div>
                <div className="row">
                    <FieldSelect formik={formik}
                                 id="propertyType"
                                 label={"Property Type"}
                                 placeholder={"Choose property type"}
                                 options={[
                                     {value: "any", text: "Any"},
                                     {value: "hotels", text: "Hotels"},
                                     {value: "apartments", text: "Apartments"},
                                 ]}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={`additionalInfo.${UI.editorLanguage}`}
                               label={"Additional Information"}
                               placeholder={"Additional Information"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={`amenities.${UI.editorLanguage}.0`}
                               label={"Amenities"}
                               placeholder={"Amenities"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.infant.lowerBound"}
                               label={"Occupancy Infant Age Lower Bound"}
                               placeholder={"0"}
                    />
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.infant.upperBound"}
                               label={"Occupancy Infant Age Upper Bound"}
                               placeholder={"3"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.child.lowerBound"}
                               label={"Occupancy Child Age Lower Bound"}
                               placeholder={"4"}
                    />
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.child.upperBound"}
                               label={"Occupancy Child Age Upper Bound"}
                               placeholder={"11"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.adult.lowerBound"}
                               label={"Occupancy Adult Age Lower Bound"}
                               placeholder={"12"}
                    />
                    <FieldText formik={formik} clearable
                               id={"occupancyDefinition.adult.upperBound"}
                               label={"Occupancy Adult Age Upper Bound"}
                               placeholder={"200"}
                    />
                </div>
                <h3>PICTURES</h3>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={`pictures.${UI.editorLanguage}.0.source`}
                               label={"Picture source link"}
                               placeholder={"https://domain/image.jpg"}
                               required
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id={`pictures.${UI.editorLanguage}.0.caption`}
                               label={"Picture caption"}
                               placeholder={"Enter picture text description"}
                               required
                    />
                </div>

                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {
                                    id ?
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
        const { redirectUrl } = this.state;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={'/'}
                            items={[
                                {
                                    text: 'Accommodations list',
                                    link: '/'
                                }, {
                                    text: 'Accommodation'
                                }
                            ]}
                        />
                        <h2>
                            { this.state.id && <div>
                                <Link to={`/accommodation/${this.state.id}/rooms`}>
                                    <button className="button go-to-rooms">
                                        Rooms management ({this.state.accommodation?.roomIds?.length || 0})
                                    </button>
                                </Link>
                            </div> }
                            <span className="brand">
                                {
                                    this.state.id ?
                                        `Edit accommodation #${this.state.id}`  :
                                        "Create new accommodation"
                                }
                            </span>
                        </h2>
                        <CachedForm
                            initialValues={this.state.accommodation}
                            onSubmit={this.submit}
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

export default withTranslation()(AccommodationPage);
