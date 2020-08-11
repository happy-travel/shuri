import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from "react-router-dom";
import {
    CachedForm, FieldSelect,
    FieldText
} from 'matsumoto/src/components/form';
import FieldDatepicker from 'matsumoto/src/components/complex/field-datepicker';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import propTypes from 'prop-types';
import UI from 'stores/shuri-ui-store';

class ContractPage extends React.Component {
    state = {
        contract: {},
        accommodationsList: null,
        id: this.props.match.params.id,
        redirect: false
    };

    componentDidMount() {
        API.get({
            url: apiMethods.accommodationsList(),
            success: result => this.setState({ accommodationsList: result })
        })

        if (!this.state.id)
            return;

        API.get({
            url: apiMethods.contractById(this.state.id),
            success: (result) => {
                this.setState({ contract: result });
            }
        })
    }

    submit = (values) => {
        const method = this.state.id ? "put" : "post",
              url = this.state.id ? apiMethods.contractById(this.state.id) : apiMethods.contractsList();

        API[method]({
            url: url,
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
                <div className="row">
                    <FieldText formik={formik} clearable
                        id="name"
                        label={"Name"}
                        placeholder={t('enter-contract-name')}
                    />
                    <FieldDatepicker formik={formik}
                                     label={"Validity Dates"}
                                     id="validityDates"
                                     first="validFrom"
                                     second="validTo"
                                     placeholder={t("Choose date")}
                    />
                </div>
                <div className="row">
                    <FieldSelect formik={formik}
                                 id="accommodationId"
                                 label={t("Accommodation")}
                                 options={
                                     this.state.accommodationsList?.map(item => ({
                                         value: item.id,
                                         text: item.name[UI.editorLanguage]
                                     }))
                                 }
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                               id="description"
                               label={"Description"}
                               placeholder={"Enter contract description"}
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="inner">
                            <button type="submit" className="button">
                                {
                                    this.state.id ?
                                        'Save changes' :
                                        t('create-contract-button')
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
            return <Redirect push to="/contracts" />;

        return (
            <div className="settings block">
                <section>
                    <h2>
                        <span className="brand">
                            {
                                this.state.id ?
                                    `Edit contract #${this.state.id}`  :
                                    this.props.t('create-contract-title')
                            }
                        </span>
                    </h2>
                    {!this.state.accommodationsList?.length ? "No accommodations found" :
                        <CachedForm
                            initialValues={this.state.contract}
                            onSubmit={this.submit}
                            render={this.renderForm}
                            enableReinitialize
                        />
                    }
                </section>
            </div>
        );
    }
}

ContractPage.propTypes = {
    t: propTypes.func
};

export default withTranslation()(ContractPage);
