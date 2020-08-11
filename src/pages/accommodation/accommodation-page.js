import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';
import {
    CachedForm,
    FieldText,
    FieldSelect
} from 'matsumoto/src/components/form';
import { Stars } from 'matsumoto/src/simple';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import UI from 'stores/shuri-ui-store';

class AccommodationPage extends React.Component {
    state = {
        accommodation: {},
        id: this.props.match.params.id,
        redirect: false
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

    submit = (values) => {
        const method = this.state.id ? "put" : "post",
              url = this.state.id ? apiMethods.accommodationById(this.state.id) : apiMethods.accommodationsList();

        API.post({
            url: apiMethods.contractsList(),
            body: values,
            success: (result) => {
                this.setState({ redirect: true });
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        return (
            <div className="form app-settings">
                { /* TODO: pictures */ }
                { /* TODO: amenities */ }
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`name.${UI.editorLanguage}`}
                        label={"Accommodation Name"}
                        placeholder={"Enter Accommodation Name"}
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`address.${UI.editorLanguage}`}
                        label={"Accommodation Address"}
                        placeholder={"Enter Accommodation Address"}
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
                         placeholder={"!!! SELECTER"}
                    />
                    <FieldText formik={formik} clearable
                         id="checkOutTime"
                         label={"Check Out Time"}
                         placeholder={"!!! SELECTER"}
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
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id="propertyType"
                               label={"Property Type"}
                               placeholder={"!!! SELECTER"}
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

                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {
                                    this.state.id ?
                                        'Save changes' :
                                        'Create accommodation'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        if (this.state.redirect)
            return <Redirect push to="/" />;

        return (
            <div className="settings block">
                <section>
                    <h2>
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
                    <div>
                        <h2>Room management</h2>
                        <Link to={`/accommodation/${this.state.id}/rooms`}>
                            <button className="button go-to-rooms">
                                Rooms available: {this.state.accommodation?.roomIds?.length || 0}
                            </button>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }
}

export default withTranslation()(AccommodationPage);
